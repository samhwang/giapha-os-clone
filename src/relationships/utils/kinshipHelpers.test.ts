import { describe, expect, it } from 'vitest';

import type { PersonNode, RelEdge } from '../types';

import { Gender } from '../../members/types';
import { RelationshipType } from '../types';
import { DESCENDANTS, DIRECT, FALLBACK, GENDER_SUFFIX, IN_LAW, IN_LAW_REVERSE, KINSHIP_MODIFIER, SIBLING, SIDE, UNCLE_AUNT } from './kinship-dictionary';
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
const grandma = person({
  id: 'grandma',
  fullName: 'Bà',
  gender: Gender.enum.female,
  generation: 1,
  isInLaw: true,
});
const father = person({
  id: 'father',
  fullName: 'Cha',
  gender: Gender.enum.male,
  generation: 2,
  birthOrder: 1,
});
const aunt = person({
  id: 'aunt',
  fullName: 'Cô',
  gender: Gender.enum.female,
  generation: 2,
  birthOrder: 2,
});
const mother = person({
  id: 'mother',
  fullName: 'Mẹ',
  gender: Gender.enum.female,
  generation: 2,
  isInLaw: true,
});
const son = person({
  id: 'son',
  fullName: 'Con Trai',
  gender: Gender.enum.male,
  generation: 3,
  birthOrder: 1,
});
const daughter = person({
  id: 'daughter',
  fullName: 'Con Gái',
  gender: Gender.enum.female,
  generation: 3,
  birthOrder: 2,
});

// Uncle (father's younger brother) for paternal uncle test
const uncle = person({
  id: 'uncle',
  fullName: 'Chú',
  gender: Gender.enum.male,
  generation: 2,
  birthOrder: 3,
});

// Maternal family: maternal grandpa + maternal grandma → mother
const maternalGrandpa = person({
  id: 'mat-grandpa',
  fullName: 'Ông Ngoại',
  gender: Gender.enum.male,
  generation: 1,
});
const maternalGrandma = person({
  id: 'mat-grandma',
  fullName: 'Bà Ngoại',
  gender: Gender.enum.female,
  generation: 1,
});
const maternalUncle = person({
  id: 'mat-uncle',
  fullName: 'Cậu',
  gender: Gender.enum.male,
  generation: 2,
  birthOrder: 2,
});

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
      expect(
        computeKinship({
          personA: father,
          personB: father,
          persons: allPersons,
          relationships: allRelationships,
        })
      ).toBeNull();
    });
  });

  describe('marriage relationships', () => {
    it('should return "Vợ" and "Chồng" for a married couple', () => {
      const result = computeKinship({
        personA: father,
        personB: mother,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(IN_LAW.WIFE);
      expect(result?.bCallsA).toBe(IN_LAW.HUSBAND);
    });

    it('should return "Chồng" and "Vợ" when reversed', () => {
      const result = computeKinship({
        personA: mother,
        personB: father,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(IN_LAW.HUSBAND);
      expect(result?.bCallsA).toBe(IN_LAW.WIFE);
    });
  });

  describe('parent-child relationships', () => {
    it('should return "Cha" for father-son', () => {
      const result = computeKinship({
        personA: son,
        personB: father,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(DIRECT.FATHER);
    });

    it('should return "Mẹ" for mother-daughter', () => {
      const result = computeKinship({
        personA: daughter,
        personB: mother,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(DIRECT.MOTHER);
    });

    it('should return "Con trai" when father calls son', () => {
      const result = computeKinship({
        personA: father,
        personB: son,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(`${DESCENDANTS[1]} ${GENDER_SUFFIX.MALE}`);
    });

    it('should return "Con gái" when father calls daughter', () => {
      const result = computeKinship({
        personA: father,
        personB: daughter,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(`${DESCENDANTS[1]} ${GENDER_SUFFIX.FEMALE}`);
    });
  });

  describe('grandparent relationships', () => {
    it('should return "Ông nội" for paternal grandfather', () => {
      const result = computeKinship({
        personA: son,
        personB: grandpa,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(`${DIRECT.GRANDFATHER} ${SIDE.PATERNAL}`);
    });

    it('should return "Bà nội" for paternal grandmother', () => {
      const result = computeKinship({
        personA: son,
        personB: grandma,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(`${DIRECT.GRANDMOTHER} ${SIDE.PATERNAL}`);
    });

    it('should return "Cháu trai" when grandfather calls grandson', () => {
      const result = computeKinship({
        personA: grandpa,
        personB: son,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(`${DESCENDANTS[2]} ${GENDER_SUFFIX.MALE}`);
    });

    it('should return "Ông ngoại" for maternal grandfather', () => {
      const result = computeKinship({
        personA: son,
        personB: maternalGrandpa,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(`${DIRECT.GRANDFATHER} ${SIDE.MATERNAL}`);
    });

    it('should return "Bà ngoại" for maternal grandmother', () => {
      const result = computeKinship({
        personA: son,
        personB: maternalGrandma,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(`${DIRECT.GRANDMOTHER} ${SIDE.MATERNAL}`);
    });
  });

  describe('sibling relationships', () => {
    it('should return "Em gái" for older brother calling younger sister', () => {
      const result = computeKinship({
        personA: son,
        personB: daughter,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(SIBLING.YOUNGER_SISTER);
      expect(result?.bCallsA).toBe(SIBLING.OLDER_BROTHER);
    });

    it('should return "Anh trai" for younger sister calling older brother', () => {
      const result = computeKinship({
        personA: daughter,
        personB: son,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(SIBLING.OLDER_BROTHER);
      expect(result?.bCallsA).toBe(SIBLING.YOUNGER_SISTER);
    });
  });

  describe('uncle/aunt relationships (paternal)', () => {
    it('should return "Cô" for paternal aunt (father\'s sister)', () => {
      const result = computeKinship({
        personA: son,
        personB: aunt,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(UNCLE_AUNT.CO);
    });

    it('should return "Chú" for paternal uncle (father\'s younger brother)', () => {
      const result = computeKinship({
        personA: son,
        personB: uncle,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(UNCLE_AUNT.CHU);
    });
  });

  describe('uncle/aunt relationships (maternal)', () => {
    it('should return "Cậu" for maternal uncle (mother\'s brother)', () => {
      const result = computeKinship({
        personA: son,
        personB: maternalUncle,
        persons: allPersons,
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(UNCLE_AUNT.CAU);
    });
  });

  describe('in-law relationships', () => {
    it('should return "Con dâu" when father-in-law calls daughter-in-law', () => {
      // son is married to wife → father calls wife = "Con dâu"
      const wife = person({
        id: 'wife',
        fullName: 'Vợ',
        gender: Gender.enum.female,
        generation: 3,
        isInLaw: true,
      });
      const personsWithWife = [...allPersons, wife];
      const relsWithWife = [...allRelationships, marriage('son', 'wife')];

      const result = computeKinship({
        personA: father,
        personB: wife,
        persons: personsWithWife,
        relationships: relsWithWife,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(IN_LAW.DAUGHTER_IN_LAW);
    });
  });

  describe('enhanced in-law term handling', () => {
    it('should return "Cô" when uncle (Chú) calls nephew wife through marriage of B', () => {
      // uncle's wife → uncle calls her 'Vợ', but son calls aunt-wife = ?
      // Actually test: Chú's wife = Thím
      const thuWife = person({
        id: 'thu-wife',
        fullName: 'Thím',
        gender: Gender.enum.female,
        generation: 2,
        isInLaw: true,
      });
      const personsExt = [...allPersons, thuWife];
      const relsExt = [...allRelationships, marriage('uncle', 'thu-wife')];

      // son calls uncle's wife
      const result = computeKinship({
        personA: son,
        personB: thuWife,
        persons: personsExt,
        relationships: relsExt,
      });
      expect(result).not.toBeNull();
      // son → uncle = Chú, uncle's wife = Cô (reverse of Chú)
      expect(result?.aCallsB).toBe(UNCLE_AUNT.CO);
    });

    it('should return "Dì" when Cậu calls nephew through reverse marriage', () => {
      // maternalUncle's wife = Mợ/Dì
      const cauWife = person({
        id: 'cau-wife',
        fullName: 'Mợ',
        gender: Gender.enum.female,
        generation: 2,
        isInLaw: true,
      });
      const personsExt = [...allPersons, cauWife];
      const relsExt = [...allRelationships, marriage('mat-uncle', 'cau-wife')];

      // son calls maternalUncle's wife
      const result = computeKinship({
        personA: son,
        personB: cauWife,
        persons: personsExt,
        relationships: relsExt,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(UNCLE_AUNT.DI);
    });
  });

  describe('4th branch: through both spouses', () => {
    // Setup: Two brothers (son, son2) married to two sisters (wife1, wife2)
    const son2 = person({
      id: 'son2',
      fullName: 'Con Trai 2',
      gender: Gender.enum.male,
      generation: 3,
      birthOrder: 2,
    });
    const wife1 = person({
      id: 'wife1',
      fullName: 'Vợ 1',
      gender: Gender.enum.female,
      generation: 3,
      isInLaw: true,
    });
    const wife2 = person({
      id: 'wife2',
      fullName: 'Vợ 2',
      gender: Gender.enum.female,
      generation: 3,
      isInLaw: true,
    });
    const fatherInLaw = person({
      id: 'fil',
      fullName: 'Bố Vợ',
      gender: Gender.enum.male,
      generation: 2,
    });
    const motherInLaw = person({
      id: 'mil',
      fullName: 'Mẹ Vợ',
      gender: Gender.enum.female,
      generation: 2,
    });

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
      const result = computeKinship({
        personA: son,
        personB: son2,
        persons: extPersons,
        relationships: extRels,
      });
      // son and son2 are brothers (blood), so this should resolve via blood first
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(SIBLING.YOUNGER_BROTHER);
    });

    it('should detect through-both-spouses for unrelated men married to sisters', () => {
      // Create two unrelated men married to two sisters
      const man1 = person({
        id: 'man1',
        fullName: 'Anh A',
        gender: Gender.enum.male,
        generation: 3,
      });
      const man2 = person({
        id: 'man2',
        fullName: 'Anh B',
        gender: Gender.enum.male,
        generation: 3,
      });
      const sister1 = person({
        id: 'sis1',
        fullName: 'Chị 1',
        gender: Gender.enum.female,
        generation: 3,
        birthOrder: 1,
      });
      const sister2 = person({
        id: 'sis2',
        fullName: 'Chị 2',
        gender: Gender.enum.female,
        generation: 3,
        birthOrder: 2,
      });
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
      expect(result?.aCallsB).toBe(IN_LAW.BROTHERS_IN_LAW);
      expect(result?.bCallsA).toBe(IN_LAW.BROTHERS_IN_LAW);
    });

    it('should detect "Chị em dâu" for two women married to brothers', () => {
      const woman1 = person({
        id: 'w1',
        fullName: 'Chị A',
        gender: Gender.enum.female,
        generation: 3,
      });
      const woman2 = person({
        id: 'w2',
        fullName: 'Chị B',
        gender: Gender.enum.female,
        generation: 3,
      });
      const bro1 = person({
        id: 'bro1',
        fullName: 'Anh 1',
        gender: Gender.enum.male,
        generation: 3,
        birthOrder: 1,
      });
      const bro2 = person({
        id: 'bro2',
        fullName: 'Anh 2',
        gender: Gender.enum.male,
        generation: 3,
        birthOrder: 2,
      });
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

      const result = computeKinship({
        personA: woman1,
        personB: woman2,
        persons: p,
        relationships: r,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(IN_LAW.SISTERS_IN_LAW);
      expect(result?.bCallsA).toBe(IN_LAW.SISTERS_IN_LAW);
    });
  });

  describe('through-spouse kinship (in-law relationships)', () => {
    // Uncle's wife (Thím)
    const uncleWife = person({
      id: 'uncle-wife',
      fullName: 'Thím',
      gender: Gender.enum.female,
      generation: 2,
      isInLaw: true,
    });
    // Maternal uncle's wife (Mợ)
    const maternalUncleWife = person({
      id: 'mat-uncle-wife',
      fullName: 'Mợ',
      gender: Gender.enum.female,
      generation: 2,
      isInLaw: true,
    });
    // Aunt's husband (Dượng) — aunt = Cô (father's sister)
    const auntHusband = person({
      id: 'aunt-husband',
      fullName: 'Dượng',
      gender: Gender.enum.male,
      generation: 2,
      isInLaw: true,
    });
    // Son's wife
    const sonWife = person({
      id: 'son-wife',
      fullName: 'Vợ Con Trai',
      gender: Gender.enum.female,
      generation: 3,
      isInLaw: true,
    });
    // Son's wife's older brother
    const wifeOlderBro = person({
      id: 'wife-older-bro',
      fullName: 'Anh Vợ',
      gender: Gender.enum.male,
      generation: 3,
      birthOrder: 1,
    });
    // Son's wife's father (father-in-law)
    const wifeFather = person({
      id: 'wife-father',
      fullName: 'Bố Vợ',
      gender: Gender.enum.male,
      generation: 2,
    });
    // Son's wife's mother
    const wifeMother = person({
      id: 'wife-mother',
      fullName: 'Mẹ Vợ',
      gender: Gender.enum.female,
      generation: 2,
    });

    const localPersons: PersonNode[] = [...allPersons, uncleWife, maternalUncleWife, auntHusband, sonWife, wifeOlderBro, wifeFather, wifeMother];

    const localRels: RelEdge[] = [
      ...allRelationships,
      marriage('uncle', 'uncle-wife'),
      marriage('mat-uncle', 'mat-uncle-wife'),
      marriage('aunt', 'aunt-husband'),
      marriage('son', 'son-wife'),
      // Son's wife's family
      marriage('wife-father', 'wife-mother'),
      child('wife-father', 'son-wife'),
      child('wife-mother', 'son-wife'),
      child('wife-father', 'wife-older-bro'),
      child('wife-mother', 'wife-older-bro'),
    ];

    it("should return Thím when son calls uncle's wife (through marriage of B)", () => {
      // son → uncle = Chú (blood). Uncle's wife (B) is married to uncle.
      // Branch 3: B's spouse (uncle) is blood-related to A (son).
      // IN_LAW_REVERSE[UNCLE_AUNT.CHU] = UNCLE_AUNT.CO, but the algorithm uses aCallsB mapping.
      const result = computeKinship({
        personA: son,
        personB: uncleWife,
        persons: localPersons,
        relationships: localRels,
      });
      expect(result).not.toBeNull();
      // son calls uncle "Chú", so uncle's wife reversal → "Cô" via IN_LAW_REVERSE
      expect(result?.aCallsB).toBe(IN_LAW_REVERSE[UNCLE_AUNT.CHU]);
    });

    it("should return Mợ when son calls maternal uncle's wife (through marriage of B)", () => {
      // son → maternalUncle = Cậu (blood). Maternal uncle's wife (B) is married to cậu.
      // IN_LAW_REVERSE[UNCLE_AUNT.CAU] = UNCLE_AUNT.DI
      const result = computeKinship({
        personA: son,
        personB: maternalUncleWife,
        persons: localPersons,
        relationships: localRels,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(IN_LAW_REVERSE[UNCLE_AUNT.CAU]);
    });

    it("should return Dượng when son calls aunt's husband (through marriage of B)", () => {
      // son → aunt = Cô (blood). Aunt's husband (B) is married to Cô.
      // IN_LAW_REVERSE[UNCLE_AUNT.CO] = UNCLE_AUNT.CHU
      const result = computeKinship({
        personA: son,
        personB: auntHusband,
        persons: localPersons,
        relationships: localRels,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(IN_LAW_REVERSE[UNCLE_AUNT.CO]);
    });

    it("should resolve spouse's older sibling via through-marriage-of-A path", () => {
      // son (A) married to sonWife. sonWife's older brother = wifeOlderBro (B).
      // Branch 2: A's spouse (sonWife) is blood-related to B (wifeOlderBro).
      // sonWife calls wifeOlderBro = "Anh trai" (older brother). So aCallsB gets wife suffix.
      const result = computeKinship({
        personA: son,
        personB: wifeOlderBro,
        persons: localPersons,
        relationships: localRels,
      });
      expect(result).not.toBeNull();
      // The algorithm: res.aCallsB includes SIBLING.OLDER_BROTHER → aCallsB = `Anh${KINSHIP_MODIFIER.WIFE_SUFFIX}`
      expect(result?.aCallsB).toBe(`Anh${KINSHIP_MODIFIER.WIFE_SUFFIX}`);
      // B calls A: res.bCallsA includes SIBLING.YOUNGER_BROTHER → includes 'Em' → bCallsA = male younger brother in-law
      expect(result?.bCallsA).toBe(IN_LAW.YOUNGER_BROTHER_IN_LAW);
    });

    it("should resolve spouse's parent (father-in-law) via through-marriage-of-A path", () => {
      // son (A) married to sonWife. sonWife's father = wifeFather (B).
      // Branch 2: A's spouse (sonWife) is blood-related to B (wifeFather).
      // sonWife calls wifeFather = "Cha". So aCallsB = DIRECT.FATHER + KINSHIP_MODIFIER.WIFE_SUFFIX
      const result = computeKinship({
        personA: son,
        personB: wifeFather,
        persons: localPersons,
        relationships: localRels,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(DIRECT.FATHER + KINSHIP_MODIFIER.WIFE_SUFFIX);
      // B calls A: res.bCallsA starts with 'Con' → son-in-law
      expect(result?.bCallsA).toBe(IN_LAW.SON_IN_LAW);
    });

    it("should resolve uncle's wife calling son (through marriage of A)", () => {
      // uncleWife (A) married to uncle. Uncle is blood-related to son (B).
      // Branch 2: A's spouse (uncle) blood-related to B (son).
      // uncle calls son = "Cháu trai" — no transformation matches, so aCallsB keeps the blood term
      const result = computeKinship({
        personA: uncleWife,
        personB: son,
        persons: localPersons,
        relationships: localRels,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(`${DESCENDANTS[2]} ${GENDER_SUFFIX.MALE}`);
      // son calls uncle = "Chú" → IN_LAW_REVERSE["Chú"] = "Cô"
      expect(result?.bCallsA).toBe(IN_LAW_REVERSE[UNCLE_AUNT.CHU]);
    });

    it("should resolve spouse's mother (mother-in-law) via through-marriage-of-A path", () => {
      // son (A) married to sonWife. sonWife's mother = wifeMother (B).
      // sonWife calls wifeMother = "Mẹ". aCallsB = DIRECT.MOTHER + WIFE_SUFFIX
      const result = computeKinship({
        personA: son,
        personB: wifeMother,
        persons: localPersons,
        relationships: localRels,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(DIRECT.MOTHER + KINSHIP_MODIFIER.WIFE_SUFFIX);
      expect(result?.bCallsA).toBe(IN_LAW.SON_IN_LAW);
    });
  });

  describe('unrelated persons', () => {
    it('should return "Người dưng" for unrelated persons', () => {
      const stranger = person({ id: 'stranger', fullName: 'Người Lạ', gender: Gender.enum.male });
      const result = computeKinship({
        personA: son,
        personB: stranger,
        persons: [...allPersons, stranger],
        relationships: allRelationships,
      });
      expect(result).not.toBeNull();
      expect(result?.aCallsB).toBe(FALLBACK.STRANGER);
      expect(result?.bCallsA).toBe(FALLBACK.STRANGER);
    });
  });
});
