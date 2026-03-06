import { describe, expect, it } from 'vitest';
import {
  binhThiMoc,
  createPerson,
  createRelationship,
  dinhThiMyDuyen,
  mockPersons,
  mockRelationships,
  vanCongGoc,
  vanCongMoc,
  vanCongThuan,
  vanCongTri,
  vanCongVien,
  vanThiBinh,
  vanThiCam,
} from '../../../test/fixtures';
import type { Person, Relationship } from '../../types';
import { Gender, RelationshipType } from '../../types';
import { buildAdjacencyLists, getFilteredTreeData } from './treeHelpers';

function toPersonsMap(persons: Person[]): Map<string, Person> {
  return new Map(persons.map((p) => [p.id, p]));
}

describe('buildAdjacencyLists', () => {
  const personsMap = toPersonsMap(mockPersons as Person[]);

  it('builds spouse maps for marriage relationships (bidirectional)', () => {
    const adj = buildAdjacencyLists(mockRelationships as Relationship[], personsMap);

    const gocSpouses = adj.spousesByPersonId.get(vanCongGoc.id);
    expect(gocSpouses).toHaveLength(1);
    expect(gocSpouses?.[0].person.id).toBe(binhThiMoc.id);

    const mocSpouses = adj.spousesByPersonId.get(binhThiMoc.id);
    expect(mocSpouses).toHaveLength(1);
    expect(mocSpouses?.[0].person.id).toBe(vanCongGoc.id);
  });

  it('builds children maps for biological_child relationships', () => {
    const adj = buildAdjacencyLists(mockRelationships as Relationship[], personsMap);

    const gocChildren = adj.childrenByPersonId.get(vanCongGoc.id);
    expect(gocChildren).toBeDefined();
    const childIds = gocChildren?.map((c) => c.id);
    expect(childIds).toContain(vanCongThuan.id);
    expect(childIds).toContain(vanThiBinh.id);
    expect(childIds).toContain(vanCongVien.id);
  });

  it('sorts children by birthOrder then birthYear', () => {
    const adj = buildAdjacencyLists(mockRelationships as Relationship[], personsMap);

    const thuanChildren = adj.childrenByPersonId.get(vanCongThuan.id)!;
    expect(thuanChildren.map((c) => c.id)).toEqual([vanCongTri.id, vanThiCam.id, vanCongMoc.id]);
  });

  it('handles adopted_child relationships', () => {
    const parent = createPerson({ id: 'parent-1', fullName: 'Parent' });
    const adopted = createPerson({ id: 'child-adopted', fullName: 'Adopted' });
    const pMap = toPersonsMap([parent, adopted] as Person[]);
    const rels = [createRelationship({ type: RelationshipType.enum.adopted_child, personAId: parent.id, personBId: adopted.id })];

    const adj = buildAdjacencyLists(rels as Relationship[], pMap);
    expect(adj.childrenByPersonId.get(parent.id)).toHaveLength(1);
    expect(adj.childrenByPersonId.get(parent.id)?.[0].id).toBe(adopted.id);
  });

  it('preserves marriage note', () => {
    const a = createPerson({ id: 'p-a' });
    const b = createPerson({ id: 'p-b', gender: Gender.enum.female });
    const pMap = toPersonsMap([a, b] as Person[]);
    const rels = [createRelationship({ type: RelationshipType.enum.marriage, personAId: a.id, personBId: b.id, note: 'first wife' })];

    const adj = buildAdjacencyLists(rels as Relationship[], pMap);
    expect(adj.spousesByPersonId.get(a.id)?.[0].note).toBe('first wife');
    expect(adj.spousesByPersonId.get(b.id)?.[0].note).toBe('first wife');
  });

  it('returns empty maps for no relationships', () => {
    const adj = buildAdjacencyLists([], personsMap);
    expect(adj.spousesByPersonId.size).toBe(0);
    expect(adj.childrenByPersonId.size).toBe(0);
  });

  it('sorts children without birthOrder to the end', () => {
    const parent = createPerson({ id: 'p-sort' });
    const childA = createPerson({ id: 'c-a', birthOrder: null, birthYear: 2000 });
    const childB = createPerson({ id: 'c-b', birthOrder: 1, birthYear: 2005 });
    const pMap = toPersonsMap([parent, childA, childB] as Person[]);
    const rels = [
      createRelationship({ type: RelationshipType.enum.biological_child, personAId: parent.id, personBId: childA.id }),
      createRelationship({ type: RelationshipType.enum.biological_child, personAId: parent.id, personBId: childB.id }),
    ];

    const adj = buildAdjacencyLists(rels as Relationship[], pMap);
    const children = adj.childrenByPersonId.get(parent.id)!;
    expect(children[0].id).toBe(childB.id);
    expect(children[1].id).toBe(childA.id);
  });
});

describe('getFilteredTreeData', () => {
  const personsMap = toPersonsMap(mockPersons as Person[]);
  const adj = buildAdjacencyLists(mockRelationships as Relationship[], personsMap);
  const noFilters = { hideSpouses: false, hideMales: false, hideFemales: false };

  it('returns person, spouses, and children for a given personId', () => {
    const data = getFilteredTreeData(vanCongGoc.id, personsMap, adj, noFilters);

    expect(data.person.id).toBe(vanCongGoc.id);
    expect(data.spouses).toHaveLength(1);
    expect(data.spouses[0].person.id).toBe(binhThiMoc.id);
    expect(data.children.length).toBeGreaterThan(0);
  });

  it('hides all spouses when hideSpouses is true', () => {
    const data = getFilteredTreeData(vanCongGoc.id, personsMap, adj, { ...noFilters, hideSpouses: true });
    expect(data.spouses).toHaveLength(0);
  });

  it('hides male spouses when hideMales is true', () => {
    // vanTriMinh is male, married to dinhThiMyDuyen (female)
    const data = getFilteredTreeData(dinhThiMyDuyen.id, personsMap, adj, { ...noFilters, hideMales: true });
    expect(data.spouses.every((s) => s.person.gender !== Gender.enum.male)).toBe(true);
  });

  it('hides female spouses when hideFemales is true', () => {
    const data = getFilteredTreeData(vanCongGoc.id, personsMap, adj, { ...noFilters, hideFemales: true });
    expect(data.spouses.every((s) => s.person.gender !== Gender.enum.female)).toBe(true);
  });

  it('hides male children when hideMales is true', () => {
    const data = getFilteredTreeData(vanCongGoc.id, personsMap, adj, { ...noFilters, hideMales: true });
    expect(data.children.every((c) => c.gender !== Gender.enum.male)).toBe(true);
  });

  it('hides female children when hideFemales is true', () => {
    const data = getFilteredTreeData(vanCongGoc.id, personsMap, adj, { ...noFilters, hideFemales: true });
    expect(data.children.every((c) => c.gender !== Gender.enum.female)).toBe(true);
  });

  it('throws when personId is not found in personsMap', () => {
    expect(() => getFilteredTreeData('non-existent', personsMap, adj, noFilters)).toThrow('Person with id non-existent not found');
  });

  it('returns empty children/spouses for a leaf node', () => {
    const data = getFilteredTreeData(vanThiCam.id, personsMap, adj, noFilters);
    expect(data.person.id).toBe(vanThiCam.id);
    expect(data.children).toHaveLength(0);
    expect(data.spouses).toHaveLength(0);
  });
});
