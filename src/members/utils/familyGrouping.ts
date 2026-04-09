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

  // Sort families by parent birth order, then own birth order
  const getFamilyScore = (members: Person[]) => {
    const coreMember = members.find((m) => !m.isInLaw) || members[0];
    const parents = parentsOf.get(coreMember.id) || [];
    let parentBirthOrder = FALLBACK_BIRTH_ORDER;
    if (parents.length > 0) {
      const p1 = personMap.get(parents[0]);
      if (p1) parentBirthOrder = p1.birthOrder || FALLBACK_BIRTH_ORDER;
    }
    return {
      parentBirthOrder,
      ownBirthOrder: coreMember.birthOrder || FALLBACK_BIRTH_ORDER,
      birthYear: coreMember.birthYear || FALLBACK_BIRTH_YEAR,
    };
  };

  const sortedGroups = Array.from(families.entries()).sort((a, b) => {
    const scoreA = getFamilyScore(a[1]);
    const scoreB = getFamilyScore(b[1]);
    if (scoreA.parentBirthOrder !== scoreB.parentBirthOrder) return scoreA.parentBirthOrder - scoreB.parentBirthOrder;
    if (scoreA.ownBirthOrder !== scoreB.ownBirthOrder) return scoreA.ownBirthOrder - scoreB.ownBirthOrder;
    return scoreA.birthYear - scoreB.birthYear;
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
