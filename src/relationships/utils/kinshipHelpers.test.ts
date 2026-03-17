import { describe, expect, it } from 'vitest';
import { Gender } from '../../members/types';
import type { PersonNode, RelEdge } from '../types';
import { RelationshipType } from '../types';
import { computeKinship } from './kinshipHelpers';

// ── Test data builders ──────────────────────────────────────────────────────

function person(overrides: Partial<PersonNode> & { id: string }): PersonNode {
  return {
    fullName: 'Test',
    gender: Gender.enum.male,
    birthYear: null,
    birthOrder: null,
    generation: null,
    isInLaw: false,
    ...overrides,
  };
}

function marriage(a: string, b: string): RelEdge {
  return { type: RelationshipType.enum.marriage, personAId: a, personBId: b };
}

function child(parent: string, childId: string): RelEdge {
  return { type: RelationshipType.enum.biological_child, personAId: parent, personBId: childId };
}

// ── Fixtures ──────────────────────────────────────────────────────

// 3-generation family:
// grandpa (m) + grandma (f) → father (m, birthOrder:1) + aunt (f, birthOrder:2)
// father + mother → son (m, birthOrder:1) + daughter (f, birthOrder:2)
const grandpa = person({ id: 'grandpa', fullName: 'Ông', gender: Gender.enum.male, generation: 1 });
const grandma = person({ id: 'grandma', fullName: 'Bà', gender: Gender.enum.female, generation: 1, isInLaw: true });
const father = person({ id: 'father', fullName: 'Cha', gender: Gender.enum.male, generation: 2, birthOrder: 1 });
const aunt = person({ id: 'aunt', fullName: 'Cô', gender: Gender.enum.female, generation: 2, birthOrder: 2 });
const mother = person({ id: 'mother', fullName: 'Mẹ', gender: Gender.enum.female, generation: 2, isInLaw: true });
const son = person({ id: 'son', fullName: 'Con Trai', gender: Gender.enum.male, generation: 3, birthOrder: 1 });
const daughter = person({ id: 'daughter', fullName: 'Con Gái', gender: Gender.enum.female, generation: 3, birthOrder: 2 });

// Uncle (father's younger brother) for paternal uncle test
const uncle = person({ id: 'uncle', fullName: 'Chú', gender: Gender.enum.male, generation: 2, birthOrder: 3 });

// Maternal family: maternal grandpa + maternal grandma → mother
const maternalGrandpa = person({ id: 'mat-grandpa', fullName: 'Ông Ngoại', gender: Gender.enum.male, generation: 1 });
const maternalGrandma = person({ id: 'mat-grandma', fullName: 'Bà Ngoại', gender: Gender.enum.female, generation: 1 });
const maternalUncle = person({ id: 'mat-uncle', fullName: 'Cậu', gender: Gender.enum.male, generation: 2, birthOrder: 2 });

const allPersons: PersonNode[] = [grandpa, grandma, father, aunt, mother, son, daughter, uncle, maternalGrandpa, maternalGrandma, maternalUncle];

const allRelationships: RelEdge[] = [
  // Gen 1 marriage + children
  marriage('grandpa', 'grandma'),
  child('grandpa', 'father'),
  child('grandma', 'father'),
  child('grandpa', 'aunt'),
  child('grandma', 'aunt'),
  child('grandpa', 'uncle'),
  child('grandma', 'uncle'),
  // Gen 2 marriage + children
  marriage('father', 'mother'),
  child('father', 'son'),
  child('mother', 'son'),
  child('father', 'daughter'),
  child('mother', 'daughter'),
  // Maternal family
  marriage('mat-grandpa', 'mat-grandma'),
  child('mat-grandpa', 'mother'),
  child('mat-grandma', 'mother'),
  child('mat-grandpa', 'mat-uncle'),
  child('mat-grandma', 'mat-uncle'),
];

// ── Tests ──────────────────────────────────────────────────────

describe('computeKinship', () => {
  describe('when both persons are the same', () => {
    it('should return null', () => {
      expect(computeKinship({ personA: father, personB: father, persons: allPersons, relationships: allRelationships })).toBeNull();
    });
  });

  describe('marriage relationships', () => {
    it('should return "Vợ" and "Chồng" for a married couple', () => {
      const result = computeKinship({ personA: father, personB: mother, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Vợ');
      expect(result?.bCallsA).toBe('Chồng');
    });

    it('should return "Chồng" and "Vợ" when reversed', () => {
      const result = computeKinship({ personA: mother, personB: father, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Chồng');
      expect(result?.bCallsA).toBe('Vợ');
    });
  });

  describe('parent-child relationships', () => {
    it('should return "Cha" for father-son', () => {
      const result = computeKinship({ personA: son, personB: father, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Cha');
    });

    it('should return "Mẹ" for mother-daughter', () => {
      const result = computeKinship({ personA: daughter, personB: mother, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Mẹ');
    });

    it('should return "Con trai" when father calls son', () => {
      const result = computeKinship({ personA: father, personB: son, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Con trai');
    });

    it('should return "Con gái" when father calls daughter', () => {
      const result = computeKinship({ personA: father, personB: daughter, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Con gái');
    });
  });

  describe('grandparent relationships', () => {
    it('should return "Ông nội" for paternal grandfather', () => {
      const result = computeKinship({ personA: son, personB: grandpa, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Ông nội');
    });

    it('should return "Bà nội" for paternal grandmother', () => {
      const result = computeKinship({ personA: son, personB: grandma, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Bà nội');
    });

    it('should return "Cháu trai" when grandfather calls grandson', () => {
      const result = computeKinship({ personA: grandpa, personB: son, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Cháu trai');
    });

    it('should return "Ông ngoại" for maternal grandfather', () => {
      const result = computeKinship({ personA: son, personB: maternalGrandpa, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Ông ngoại');
    });

    it('should return "Bà ngoại" for maternal grandmother', () => {
      const result = computeKinship({ personA: son, personB: maternalGrandma, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Bà ngoại');
    });
  });

  describe('sibling relationships', () => {
    it('should return "Em gái" for older brother calling younger sister', () => {
      const result = computeKinship({ personA: son, personB: daughter, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Em gái');
      expect(result?.bCallsA).toBe('Anh trai');
    });

    it('should return "Anh trai" for younger sister calling older brother', () => {
      const result = computeKinship({ personA: daughter, personB: son, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Anh trai');
      expect(result?.bCallsA).toBe('Em gái');
    });
  });

  describe('uncle/aunt relationships (paternal)', () => {
    it('should return "Cô" for paternal aunt (father\'s sister)', () => {
      const result = computeKinship({ personA: son, personB: aunt, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Cô');
    });

    it('should return "Chú" for paternal uncle (father\'s younger brother)', () => {
      const result = computeKinship({ personA: son, personB: uncle, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Chú');
    });
  });

  describe('uncle/aunt relationships (maternal)', () => {
    it('should return "Cậu" for maternal uncle (mother\'s brother)', () => {
      const result = computeKinship({ personA: son, personB: maternalUncle, persons: allPersons, relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Cậu');
    });
  });

  describe('in-law relationships', () => {
    it('should return "Con dâu" when father-in-law calls daughter-in-law', () => {
      // son is married to wife → father calls wife = "Con dâu"
      const wife = person({ id: 'wife', fullName: 'Vợ', gender: Gender.enum.female, generation: 3, isInLaw: true });
      const personsWithWife = [...allPersons, wife];
      const relsWithWife = [...allRelationships, marriage('son', 'wife')];

      const result = computeKinship({ personA: father, personB: wife, persons: personsWithWife, relationships: relsWithWife });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Con dâu');
    });
  });

  describe('enhanced in-law term handling', () => {
    it('should return "Cô" when uncle (Chú) calls nephew wife through marriage of B', () => {
      // uncle's wife → uncle calls her 'Vợ', but son calls aunt-wife = ?
      // Actually test: Chú's wife = Thím
      const thuWife = person({ id: 'thu-wife', fullName: 'Thím', gender: Gender.enum.female, generation: 2, isInLaw: true });
      const personsExt = [...allPersons, thuWife];
      const relsExt = [...allRelationships, marriage('uncle', 'thu-wife')];

      // son calls uncle's wife
      const result = computeKinship({ personA: son, personB: thuWife, persons: personsExt, relationships: relsExt });
      expect(result).not.toBeNull();
      // son → uncle = Chú, uncle's wife = Cô (reverse of Chú)
      expect(result?.aCallsB).toBe('Cô');
    });

    it('should return "Dì" when Cậu calls nephew through reverse marriage', () => {
      // maternalUncle's wife = Mợ/Dì
      const cauWife = person({ id: 'cau-wife', fullName: 'Mợ', gender: Gender.enum.female, generation: 2, isInLaw: true });
      const personsExt = [...allPersons, cauWife];
      const relsExt = [...allRelationships, marriage('mat-uncle', 'cau-wife')];

      // son calls maternalUncle's wife
      const result = computeKinship({ personA: son, personB: cauWife, persons: personsExt, relationships: relsExt });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Dì');
    });
  });

  describe('4th branch: through both spouses', () => {
    // Setup: Two brothers (son, son2) married to two sisters (wife1, wife2)
    const son2 = person({ id: 'son2', fullName: 'Con Trai 2', gender: Gender.enum.male, generation: 3, birthOrder: 2 });
    const wife1 = person({ id: 'wife1', fullName: 'Vợ 1', gender: Gender.enum.female, generation: 3, isInLaw: true });
    const wife2 = person({ id: 'wife2', fullName: 'Vợ 2', gender: Gender.enum.female, generation: 3, isInLaw: true });
    const fatherInLaw = person({ id: 'fil', fullName: 'Bố Vợ', gender: Gender.enum.male, generation: 2 });
    const motherInLaw = person({ id: 'mil', fullName: 'Mẹ Vợ', gender: Gender.enum.female, generation: 2 });

    const extPersons = [...allPersons, son2, wife1, wife2, fatherInLaw, motherInLaw];
    const extRels = [
      ...allRelationships,
      child('father', 'son2'),
      child('mother', 'son2'),
      marriage('fil', 'mil'),
      child('fil', 'wife1'),
      child('mil', 'wife1'),
      child('fil', 'wife2'),
      child('mil', 'wife2'),
      marriage('son', 'wife1'),
      marriage('son2', 'wife2'),
    ];

    it('should return "Anh em cột chèo" for two brothers-in-law married to sisters', () => {
      const result = computeKinship({ personA: son, personB: son2, persons: extPersons, relationships: extRels });
      // son and son2 are brothers (blood), so this should resolve via blood first
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Em trai');
    });

    it('should detect through-both-spouses for unrelated men married to sisters', () => {
      // Create two unrelated men married to two sisters
      const man1 = person({ id: 'man1', fullName: 'Anh A', gender: Gender.enum.male, generation: 3 });
      const man2 = person({ id: 'man2', fullName: 'Anh B', gender: Gender.enum.male, generation: 3 });
      const sister1 = person({ id: 'sis1', fullName: 'Chị 1', gender: Gender.enum.female, generation: 3, birthOrder: 1 });
      const sister2 = person({ id: 'sis2', fullName: 'Chị 2', gender: Gender.enum.female, generation: 3, birthOrder: 2 });
      const dad = person({ id: 'dad', fullName: 'Bố', gender: Gender.enum.male, generation: 2 });
      const mom = person({ id: 'mom', fullName: 'Mẹ', gender: Gender.enum.female, generation: 2 });

      const p = [man1, man2, sister1, sister2, dad, mom];
      const r: RelEdge[] = [
        marriage('dad', 'mom'),
        child('dad', 'sis1'),
        child('mom', 'sis1'),
        child('dad', 'sis2'),
        child('mom', 'sis2'),
        marriage('man1', 'sis1'),
        marriage('man2', 'sis2'),
      ];

      const result = computeKinship({ personA: man1, personB: man2, persons: p, relationships: r });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Anh em cột chèo');
      expect(result?.bCallsA).toBe('Anh em cột chèo');
    });

    it('should detect "Chị em dâu" for two women married to brothers', () => {
      const woman1 = person({ id: 'w1', fullName: 'Chị A', gender: Gender.enum.female, generation: 3 });
      const woman2 = person({ id: 'w2', fullName: 'Chị B', gender: Gender.enum.female, generation: 3 });
      const bro1 = person({ id: 'bro1', fullName: 'Anh 1', gender: Gender.enum.male, generation: 3, birthOrder: 1 });
      const bro2 = person({ id: 'bro2', fullName: 'Anh 2', gender: Gender.enum.male, generation: 3, birthOrder: 2 });
      const dad = person({ id: 'dad2', fullName: 'Bố', gender: Gender.enum.male, generation: 2 });
      const mom = person({ id: 'mom2', fullName: 'Mẹ', gender: Gender.enum.female, generation: 2 });

      const p = [woman1, woman2, bro1, bro2, dad, mom];
      const r: RelEdge[] = [
        marriage('dad2', 'mom2'),
        child('dad2', 'bro1'),
        child('mom2', 'bro1'),
        child('dad2', 'bro2'),
        child('mom2', 'bro2'),
        marriage('bro1', 'w1'),
        marriage('bro2', 'w2'),
      ];

      const result = computeKinship({ personA: woman1, personB: woman2, persons: p, relationships: r });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Chị em dâu');
      expect(result?.bCallsA).toBe('Chị em dâu');
    });
  });

  describe('unrelated persons', () => {
    it('should return "Người dưng" for unrelated persons', () => {
      const stranger = person({ id: 'stranger', fullName: 'Người Lạ', gender: Gender.enum.male });
      const result = computeKinship({ personA: son, personB: stranger, persons: [...allPersons, stranger], relationships: allRelationships });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Người dưng');
      expect(result?.bCallsA).toBe('Người dưng');
    });
  });
});
