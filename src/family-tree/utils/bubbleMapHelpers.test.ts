import { describe, expect, it } from 'vitest';
import { Gender, type Person } from '../../members/types';
import { type Relationship, RelationshipType } from '../../relationships/types';
import { buildGraphData } from './bubbleMapHelpers';
import { buildAdjacencyLists } from './treeHelpers';

function makePerson(overrides: Partial<Person> & { id: string }): Person {
  return {
    fullName: 'Test Person',
    gender: Gender.enum.male,
    birthYear: null,
    birthMonth: null,
    birthDay: null,
    deathYear: null,
    deathMonth: null,
    deathDay: null,
    deathLunarYear: null,
    deathLunarMonth: null,
    deathLunarDay: null,
    isDeceased: false,
    isInLaw: false,
    birthOrder: null,
    generation: null,
    otherNames: null,
    avatarUrl: null,
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRel(overrides: Partial<Relationship> & { personAId: string; personBId: string }): Relationship {
  return {
    id: `rel-${overrides.personAId}-${overrides.personBId}`,
    type: RelationshipType.enum.biological_child,
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('buildGraphData', () => {
  it('creates nodes for root persons', () => {
    const root = makePerson({ id: 'r1', fullName: 'Root' });
    const personsMap = new Map([['r1', root]]);
    const adj = buildAdjacencyLists([], personsMap);

    const { nodes, links } = buildGraphData([root], personsMap, adj);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].id).toBe('r1');
    expect(nodes[0].isRoot).toBe(true);
    expect(nodes[0].radius).toBe(40);
    expect(links).toHaveLength(0);
  });

  it('creates links between parent and child', () => {
    const parent = makePerson({ id: 'p1', fullName: 'Parent' });
    const child = makePerson({ id: 'c1', fullName: 'Child' });
    const rel = makeRel({ personAId: 'p1', personBId: 'c1', type: RelationshipType.enum.biological_child });
    const personsMap = new Map([
      ['p1', parent],
      ['c1', child],
    ]);
    const adj = buildAdjacencyLists([rel], personsMap);

    const { nodes, links } = buildGraphData([parent], personsMap, adj);

    expect(nodes).toHaveLength(2);
    expect(links).toHaveLength(1);
    expect(links[0].source).toBe('p1');
    expect(links[0].target).toBe('c1');
  });

  it('groups spouses into a single node', () => {
    const husband = makePerson({ id: 'h1', fullName: 'Husband', gender: Gender.enum.male });
    const wife = makePerson({ id: 'w1', fullName: 'Wife', gender: Gender.enum.female });
    const marriage = makeRel({ personAId: 'h1', personBId: 'w1', type: RelationshipType.enum.marriage });
    const personsMap = new Map([
      ['h1', husband],
      ['w1', wife],
    ]);
    const adj = buildAdjacencyLists([marriage], personsMap);

    const { nodes } = buildGraphData([husband], personsMap, adj);

    // Husband node should contain both people
    const husbandNode = nodes.find((n) => n.id === 'h1');
    expect(husbandNode?.people).toHaveLength(2);
    expect(husbandNode?.people.map((p) => p.id)).toContain('w1');
  });

  it('sets non-root nodes with smaller radius', () => {
    const parent = makePerson({ id: 'p1' });
    const child = makePerson({ id: 'c1' });
    const rel = makeRel({ personAId: 'p1', personBId: 'c1' });
    const personsMap = new Map([
      ['p1', parent],
      ['c1', child],
    ]);
    const adj = buildAdjacencyLists([rel], personsMap);

    const { nodes } = buildGraphData([parent], personsMap, adj);

    const childNode = nodes.find((n) => n.id === 'c1');
    expect(childNode?.radius).toBe(30);
    expect(childNode?.isRoot).toBe(false);
  });
});
