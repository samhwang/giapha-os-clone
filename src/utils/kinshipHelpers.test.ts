import { describe, expect, it } from 'vitest';
import type { PersonNode, RelEdge } from '@/types';
import { computeKinship } from './kinshipHelpers';

// ── Test data builders ──────────────────────────────────────────────────────

function person(overrides: Partial<PersonNode> & { id: string }): PersonNode {
  return {
    fullName: 'Test',
    gender: 'male',
    birthYear: null,
    birthOrder: null,
    generation: null,
    isInLaw: false,
    ...overrides,
  };
}

function marriage(a: string, b: string): RelEdge {
  return { type: 'marriage', personAId: a, personBId: b };
}

function child(parent: string, childId: string): RelEdge {
  return { type: 'biological_child', personAId: parent, personBId: childId };
}

// ── Fixtures ──────────────────────────────────────────────────────

// 3-generation family:
// grandpa (m) + grandma (f) → father (m, birthOrder:1) + aunt (f, birthOrder:2)
// father + mother → son (m, birthOrder:1) + daughter (f, birthOrder:2)
const grandpa = person({ id: 'grandpa', fullName: 'Ông', gender: 'male', generation: 1 });
const grandma = person({ id: 'grandma', fullName: 'Bà', gender: 'female', generation: 1, isInLaw: true });
const father = person({ id: 'father', fullName: 'Cha', gender: 'male', generation: 2, birthOrder: 1 });
const aunt = person({ id: 'aunt', fullName: 'Cô', gender: 'female', generation: 2, birthOrder: 2 });
const mother = person({ id: 'mother', fullName: 'Mẹ', gender: 'female', generation: 2, isInLaw: true });
const son = person({ id: 'son', fullName: 'Con Trai', gender: 'male', generation: 3, birthOrder: 1 });
const daughter = person({ id: 'daughter', fullName: 'Con Gái', gender: 'female', generation: 3, birthOrder: 2 });

// Uncle (father's younger brother) for paternal uncle test
const uncle = person({ id: 'uncle', fullName: 'Chú', gender: 'male', generation: 2, birthOrder: 3 });

// Maternal family: maternal grandpa + maternal grandma → mother
const maternalGrandpa = person({ id: 'mat-grandpa', fullName: 'Ông Ngoại', gender: 'male', generation: 1 });
const maternalGrandma = person({ id: 'mat-grandma', fullName: 'Bà Ngoại', gender: 'female', generation: 1 });
const maternalUncle = person({ id: 'mat-uncle', fullName: 'Cậu', gender: 'male', generation: 2, birthOrder: 2 });

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
      expect(computeKinship(father, father, allPersons, allRelationships)).toBeNull();
    });
  });

  describe('marriage relationships', () => {
    it('should return "Vợ" and "Chồng" for a married couple', () => {
      const result = computeKinship(father, mother, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Vợ');
      expect(result?.bCallsA).toBe('Chồng');
    });

    it('should return "Chồng" and "Vợ" when reversed', () => {
      const result = computeKinship(mother, father, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Chồng');
      expect(result?.bCallsA).toBe('Vợ');
    });
  });

  describe('parent-child relationships', () => {
    it('should return "Cha" for father-son', () => {
      const result = computeKinship(son, father, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Cha');
    });

    it('should return "Mẹ" for mother-daughter', () => {
      const result = computeKinship(daughter, mother, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Mẹ');
    });

    it('should return "Con trai" when father calls son', () => {
      const result = computeKinship(father, son, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Con trai');
    });

    it('should return "Con gái" when father calls daughter', () => {
      const result = computeKinship(father, daughter, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Con gái');
    });
  });

  describe('grandparent relationships', () => {
    it('should return "Ông nội" for paternal grandfather', () => {
      const result = computeKinship(son, grandpa, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Ông nội');
    });

    it('should return "Bà nội" for paternal grandmother', () => {
      const result = computeKinship(son, grandma, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Bà nội');
    });

    it('should return "Cháu trai" when grandfather calls grandson', () => {
      const result = computeKinship(grandpa, son, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Cháu trai');
    });

    it('should return "Ông ngoại" for maternal grandfather', () => {
      const result = computeKinship(son, maternalGrandpa, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Ông ngoại');
    });

    it('should return "Bà ngoại" for maternal grandmother', () => {
      const result = computeKinship(son, maternalGrandma, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Bà ngoại');
    });
  });

  describe('sibling relationships', () => {
    it('should return "Em gái" for older brother calling younger sister', () => {
      const result = computeKinship(son, daughter, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Em gái');
      expect(result?.bCallsA).toBe('Anh trai');
    });

    it('should return "Anh trai" for younger sister calling older brother', () => {
      const result = computeKinship(daughter, son, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Anh trai');
      expect(result?.bCallsA).toBe('Em gái');
    });
  });

  describe('uncle/aunt relationships (paternal)', () => {
    it('should return "Cô" for paternal aunt (father\'s sister)', () => {
      const result = computeKinship(son, aunt, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Cô');
    });

    it('should return "Chú" for paternal uncle (father\'s younger brother)', () => {
      const result = computeKinship(son, uncle, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Chú');
    });
  });

  describe('uncle/aunt relationships (maternal)', () => {
    it('should return "Cậu" for maternal uncle (mother\'s brother)', () => {
      const result = computeKinship(son, maternalUncle, allPersons, allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Cậu');
    });
  });

  describe('in-law relationships', () => {
    it('should return "Con dâu" when father-in-law calls daughter-in-law', () => {
      // son is married to wife → father calls wife = "Con dâu"
      const wife = person({ id: 'wife', fullName: 'Vợ', gender: 'female', generation: 3, isInLaw: true });
      const personsWithWife = [...allPersons, wife];
      const relsWithWife = [...allRelationships, marriage('son', 'wife')];

      const result = computeKinship(father, wife, personsWithWife, relsWithWife);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Con dâu');
    });
  });

  describe('unrelated persons', () => {
    it('should return "Người dưng" for unrelated persons', () => {
      const stranger = person({ id: 'stranger', fullName: 'Người Lạ', gender: 'male' });
      const result = computeKinship(son, stranger, [...allPersons, stranger], allRelationships);
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe('Người dưng');
      expect(result?.bCallsA).toBe('Người dưng');
    });
  });
});
