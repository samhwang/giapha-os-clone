import type { Person, Relationship } from '../../types';

export interface SpouseData {
  person: Person;
  note?: string | null;
}

export interface AdjacencyLists {
  spousesByPersonId: Map<string, SpouseData[]>;
  childrenByPersonId: Map<string, Person[]>;
}

export interface TreeFilterOptions {
  hideSpouses: boolean;
  hideMales: boolean;
  hideFemales: boolean;
}

/**
 * Pre-computes adjacency lists for spouses and children from raw data.
 * Optimises per-node lookups from O(N) to O(1).
 */
export function buildAdjacencyLists(relationships: Relationship[], personsMap: Map<string, Person>): AdjacencyLists {
  const spouses = new Map<string, SpouseData[]>();
  const children = new Map<string, Person[]>();

  for (const r of relationships) {
    if (r.type === 'marriage') {
      if (!spouses.has(r.personAId)) spouses.set(r.personAId, []);
      if (!spouses.has(r.personBId)) spouses.set(r.personBId, []);

      const pB = personsMap.get(r.personBId);
      if (pB) spouses.get(r.personAId)?.push({ person: pB, note: r.note });

      const pA = personsMap.get(r.personAId);
      if (pA) spouses.get(r.personBId)?.push({ person: pA, note: r.note });
    } else if (r.type === 'biological_child' || r.type === 'adopted_child') {
      if (!children.has(r.personAId)) children.set(r.personAId, []);
      const child = personsMap.get(r.personBId);
      if (child) children.get(r.personAId)?.push(child);
    }
  }

  // Sort children by birthOrder then birthYear
  for (const childArray of children.values()) {
    childArray.sort((a, b) => {
      const aOrder = a.birthOrder ?? Number.POSITIVE_INFINITY;
      const bOrder = b.birthOrder ?? Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      const aYear = a.birthYear ?? Number.POSITIVE_INFINITY;
      const bYear = b.birthYear ?? Number.POSITIVE_INFINITY;
      return aYear - bYear;
    });
  }

  return { spousesByPersonId: spouses, childrenByPersonId: children };
}

/**
 * Gets filtered tree data for a single node (spouses + children) using
 * pre-computed adjacency lists.
 */
export function getFilteredTreeData(personId: string, personsMap: Map<string, Person>, adj: AdjacencyLists, filters: TreeFilterOptions) {
  const { hideSpouses, hideMales, hideFemales } = filters;

  let spousesList = adj.spousesByPersonId.get(personId) || [];
  if (hideSpouses) {
    spousesList = [];
  } else {
    spousesList = spousesList.filter((s) => {
      if (hideMales && s.person.gender === 'male') return false;
      if (hideFemales && s.person.gender === 'female') return false;
      return true;
    });
  }

  let childrenList = adj.childrenByPersonId.get(personId) || [];
  childrenList = childrenList.filter((c) => {
    if (hideMales && c.gender === 'male') return false;
    if (hideFemales && c.gender === 'female') return false;
    return true;
  });

  const person = personsMap.get(personId);
  if (!person) {
    throw new Error(`Person with id ${personId} not found`);
  }

  return {
    person,
    spouses: spousesList,
    children: childrenList,
  };
}
