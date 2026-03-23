import type * as d3 from 'd3';
import type { Person } from '../../members/types';
import type { AdjacencyLists } from './treeHelpers';
import { getFilteredTreeData } from './treeHelpers';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  people: Person[];
  radius: number;
  width: number;
  isRoot: boolean;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  type: string;
}

const NO_FILTERS = {
  hideDaughtersInLaw: false,
  hideSonsInLaw: false,
  hideDaughters: false,
  hideSons: false,
  hideMales: false,
  hideFemales: false,
};

/**
 * Build graph nodes (family units) and links (parent-child) from the family tree.
 * Each node groups a person with their spouses into a single "pill" unit.
 */
export function buildGraphData(roots: Person[], personsMap: Map<string, Person>, adj: AdjacencyLists): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodeMap = new Map<string, GraphNode>();
  const linkArray: GraphLink[] = [];

  const addFamilyUnit = (mainPerson: Person, spouses: Person[], isRoot: boolean) => {
    const people = [mainPerson, ...spouses];
    const radius = isRoot ? 40 : 30;
    const width = people.length === 1 ? radius * 2 : radius * 2 + (people.length - 1) * radius * 1.5;

    if (!nodeMap.has(mainPerson.id)) {
      nodeMap.set(mainPerson.id, { id: mainPerson.id, people, radius, width, isRoot });
    }
  };

  const walk = (personId: string, visited: Set<string>) => {
    if (visited.has(personId)) return;
    visited.add(personId);

    const data = getFilteredTreeData({ personId, personsMap, adj, filters: NO_FILTERS });
    if (!data.person) return;

    const spouses = data.spouses.map((s) => s.person);
    addFamilyUnit(
      data.person,
      spouses,
      roots.some((r) => r.id === personId)
    );

    for (const child of data.children) {
      linkArray.push({ source: personId, target: child.id, type: 'child' });
      walk(child.id, new Set(visited));
    }
  };

  for (const root of roots) {
    walk(root.id, new Set());
  }

  return { nodes: Array.from(nodeMap.values()), links: linkArray };
}
