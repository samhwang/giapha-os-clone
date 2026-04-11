import type { Person } from '../types';

const FALLBACK_BIRTH_ORDER = 999;
export const FALLBACK_BIRTH_YEAR = 9999;
const FALLBACK_GENERATION = 999;
const MAX_LINEAGE_DEPTH = 20;

export type PersonWithFamily = Person & { _familyId?: string };

const compareBirthOrder = (a: Person, b: Person) => (a.birthOrder ?? FALLBACK_BIRTH_ORDER) - (b.birthOrder ?? FALLBACK_BIRTH_ORDER);

const compareBirthYear = (a: Person, b: Person) => (a.birthYear ?? FALLBACK_BIRTH_YEAR) - (b.birthYear ?? FALLBACK_BIRTH_YEAR);

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

  // Lineage scores ensure deeper generations inherit correct positioning from their full ancestry,
  // not just their immediate parent.
  const lineageScoreCache = new Map<string, number[]>();

  const getPrimaryBloodlineMember = (members: Person[]): Person => {
    const bloodline = members.filter((m) => !m.isInLaw);
    if (bloodline.length === 0) return members[0];
    return bloodline.reduce((best, m) => ((compareBirthOrder(m, best) || compareBirthYear(m, best)) < 0 ? m : best));
  };

  const getBloodlineParent = (person: Person): Person | null => {
    const parentIds = parentsOf.get(person.id) || [];
    const parentPersons = parentIds.map((id) => personMap.get(id)).filter((p): p is Person => !!p);

    return parentPersons.find((p) => !p.isInLaw) || parentPersons[0] || null;
  };

  const getPersonLineageScore = (person: Person, depth = 0): number[] => {
    if (lineageScoreCache.has(person.id)) {
      return lineageScoreCache.get(person.id)!;
    }

    const ownPart = [person.birthOrder ?? FALLBACK_BIRTH_ORDER, person.birthYear ?? FALLBACK_BIRTH_YEAR];

    const parent = depth < MAX_LINEAGE_DEPTH ? getBloodlineParent(person) : null;

    if (!parent) {
      lineageScoreCache.set(person.id, ownPart);
      return ownPart;
    }

    const score = [...getPersonLineageScore(parent, depth + 1), ...ownPart];
    lineageScoreCache.set(person.id, score);
    return score;
  };

  // Precompute scores per group to avoid repeated work in the comparator
  const groupScores = new Map<string, number[]>();
  for (const [groupId, members] of families) {
    const coreMember = getPrimaryBloodlineMember(members);
    groupScores.set(groupId, getPersonLineageScore(coreMember));
  }

  const sortedGroups = Array.from(families.entries()).sort((a, b) => {
    const scoreA = groupScores.get(a[0])!;
    const scoreB = groupScores.get(b[0])!;

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
    const genA = a.generation ?? FALLBACK_GENERATION;
    const genB = b.generation ?? FALLBACK_GENERATION;
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
      return compareBirthOrder(refA, refB) || compareBirthYear(refA, refB);
    }

    // Same bloodline partner — bloodline member first
    if (a.isInLaw !== b.isInLaw) return a.isInLaw ? 1 : -1;
    return compareBirthYear(a, b);
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
    const bloodline = group.filter((m) => !m.isInLaw).sort(compareBirthYear);
    const inLaws = group.filter((m) => m.isInLaw).sort(compareBirthYear);
    groups.push([...bloodline, ...inLaws]);
  }

  return groups;
}
