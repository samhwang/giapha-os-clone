import type { Person } from '../types';

const FALLBACK_BIRTH_ORDER = 999;
export const FALLBACK_BIRTH_YEAR = 9999;
const FALLBACK_GENERATION = 999;

export type PersonWithFamily = Person & { _familyId?: string };

export function getGroupId(personId: string, parentsOf: Map<string, string[]>, spousesOf: Map<string, string[]>): string {
  const parents = parentsOf.get(personId) || [];
  if (parents.length > 0) return `parents_${[...parents].sort().join('_')}`;

  // BFS through marriage cluster to find a bloodline member
  const visited = new Set<string>([personId]);
  const queue = [personId];
  const cluster: string[] = [];

  while (queue.length > 0) {
    const curr = queue.shift();
    if (!curr) continue;
    cluster.push(curr);
    const pts = parentsOf.get(curr);
    if (pts && pts.length > 0) return `parents_${[...pts].sort().join('_')}`;

    for (const s of spousesOf.get(curr) || []) {
      if (visited.has(s)) continue;
      visited.add(s);
      queue.push(s);
    }
  }

  return `spouses_${[...cluster].sort()[0]}`;
}

export function buildFamilyGroupedSort(
  filteredPersons: Person[],
  allPersons: Person[],
  parentsOf: Map<string, string[]>,
  spousesOf: Map<string, string[]>,
  sortOption: string
): PersonWithFamily[] {
  const personMap = new Map<string, Person>();
  for (const p of allPersons) personMap.set(p.id, p);

  // Group persons into families
  const families = new Map<string, Person[]>();
  for (const p of filteredPersons) {
    const groupId = getGroupId(p.id, parentsOf, spousesOf);
    if (!families.has(groupId)) families.set(groupId, []);
    families.get(groupId)?.push(p);
  }

  // Each family is ranked by building a recursive "lineage score" from its core bloodline member.
  // The score includes ancestor → parent → self ordering (birthOrder, then birthYear at each level).
  // This ensures deeper generations (e.g. 4th, 5th) inherit correct positioning from their full ancestry,
  // not just their immediate parent, resulting in stable and accurate family ordering across generations.
  const lineageScoreCache = new Map<string, number[]>();

  const getPrimaryBloodlineMember = (members: Person[]): Person => {
    return (
      members
        .filter((m: Person) => !m.isInLaw)
        .sort((a: Person, b: Person) => {
          if ((a.birthOrder ?? FALLBACK_BIRTH_ORDER) !== (b.birthOrder ?? FALLBACK_BIRTH_ORDER)) {
            return (a.birthOrder ?? FALLBACK_BIRTH_ORDER) - (b.birthOrder ?? FALLBACK_BIRTH_ORDER);
          }
          return (a.birthYear ?? FALLBACK_BIRTH_YEAR) - (b.birthYear ?? FALLBACK_BIRTH_YEAR);
        })[0] || members[0]
    );
  };

  const getBloodlineParent = (person: Person): Person | null => {
    const parentIds = parentsOf.get(person.id) || [];
    const parentPersons = parentIds.map((id: string) => personMap.get(id)).filter((p): p is Person => !!p);

    return parentPersons.find((p: Person) => !p.isInLaw) || parentPersons[0] || null;
  };

  const getPersonLineageScore = (person: Person): number[] => {
    if (lineageScoreCache.has(person.id)) {
      return lineageScoreCache.get(person.id)!;
    }

    const parent = getBloodlineParent(person);

    const ownPart = [person.birthOrder ?? FALLBACK_BIRTH_ORDER, person.birthYear ?? FALLBACK_BIRTH_YEAR];

    if (!parent) {
      lineageScoreCache.set(person.id, ownPart);
      return ownPart;
    }

    const score = [...getPersonLineageScore(parent), ...ownPart];
    lineageScoreCache.set(person.id, score);
    return score;
  };

  const getFamilyScore = (_groupId: string, members: Person[]): number[] => {
    const coreMember = getPrimaryBloodlineMember(members);
    return getPersonLineageScore(coreMember);
  };

  const sortedGroups = Array.from(families.entries()).sort((a: [string, Person[]], b: [string, Person[]]) => {
    const scoreA = getFamilyScore(a[0], a[1]);
    const scoreB = getFamilyScore(b[0], b[1]);

    const maxLen = Math.max(scoreA.length, scoreB.length);

    for (let i = 0; i < maxLen; i++) {
      const valA = scoreA[i] ?? FALLBACK_BIRTH_YEAR;
      const valB = scoreB[i] ?? FALLBACK_BIRTH_YEAR;

      if (valA !== valB) {
        return valA - valB;
      }
    }

    return 0;
  });

  // Sort within each family: bloodline first, by birth order, spouses follow their partner
  const result: PersonWithFamily[] = [];
  for (const [groupId, members] of sortedGroups) {
    const sorted = sortFamilyMembers(members, spousesOf);
    for (const m of sorted) result.push({ ...m, _familyId: groupId });
  }

  // Stable sort by generation
  result.sort((a, b) => {
    const genA = a.generation || FALLBACK_GENERATION;
    const genB = b.generation || FALLBACK_GENERATION;
    if (genA !== genB) return sortOption === 'generation_desc' ? genB - genA : genA - genB;
    return 0;
  });

  return result;
}

export function sortFamilyMembers(members: Person[], spousesOf: Map<string, string[]>): Person[] {
  const getBloodlineRef = (p: Person) => {
    if (!p.isInLaw) return p;
    const spIds = spousesOf.get(p.id) || [];
    return members.find((m) => spIds.includes(m.id) && !m.isInLaw) || p;
  };

  return [...members].sort((a, b) => {
    const refA = getBloodlineRef(a);
    const refB = getBloodlineRef(b);

    if (refA.id !== refB.id) {
      if ((refA.birthOrder || FALLBACK_BIRTH_ORDER) !== (refB.birthOrder || FALLBACK_BIRTH_ORDER))
        return (refA.birthOrder || FALLBACK_BIRTH_ORDER) - (refB.birthOrder || FALLBACK_BIRTH_ORDER);
      return (refA.birthYear || FALLBACK_BIRTH_YEAR) - (refB.birthYear || FALLBACK_BIRTH_YEAR);
    }

    // Same bloodline partner — bloodline member first
    if (a.isInLaw !== b.isInLaw) return a.isInLaw ? 1 : -1;
    return (a.birthYear || FALLBACK_BIRTH_YEAR) - (b.birthYear || FALLBACK_BIRTH_YEAR);
  });
}

export function buildCoupleGroups(famPersons: Person[], spousesOf: Map<string, string[]>): Person[][] {
  const personById = new Map<string, Person>();
  for (const p of famPersons) personById.set(p.id, p);

  const placed = new Set<string>();
  const groups: Person[][] = [];

  for (const p of famPersons) {
    if (placed.has(p.id)) continue;
    const group = [p];
    placed.add(p.id);

    const queue = [p.id];
    while (queue.length > 0) {
      const curr = queue.shift();
      if (!curr) continue;
      for (const spId of spousesOf.get(curr) || []) {
        if (placed.has(spId)) continue;
        const spObj = personById.get(spId);
        if (!spObj) continue;
        group.push(spObj);
        placed.add(spId);
        queue.push(spId);
      }
    }

    // Order: bloodline first, then in-laws
    const bloodline = group.filter((m) => !m.isInLaw).sort((a, b) => (a.birthYear || FALLBACK_BIRTH_YEAR) - (b.birthYear || FALLBACK_BIRTH_YEAR));
    const inLaws = group.filter((m) => m.isInLaw).sort((a, b) => (a.birthYear || FALLBACK_BIRTH_YEAR) - (b.birthYear || FALLBACK_BIRTH_YEAR));
    groups.push([...bloodline, ...inLaws]);
  }

  return groups;
}
