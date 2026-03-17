import { describe, expect, it } from 'vitest';
import { createPerson, createRelationship } from '../../../test/fixtures';
import type { Person } from '../../members/types';
import { Gender } from '../../members/types';
import type { Relationship } from '../../relationships/types';
import { RelationshipType } from '../../relationships/types';
import { exportToGedcom, parseGedcom } from './gedcom';

const makePerson = (overrides: Partial<Person> = {}) => createPerson(overrides) as Person;
const makeRel = (overrides: Partial<Relationship> = {}) => createRelationship(overrides) as Relationship;

describe('exportToGedcom', () => {
  it('produces valid GEDCOM 7.0 header and trailer', () => {
    const result = exportToGedcom({ persons: [], relationships: [] });
    expect(result).toContain('0 HEAD');
    expect(result).toContain('2 VERS 7.0');
    expect(result).toContain('0 TRLR');
  });

  it('exports individual with name, sex, and birth date', () => {
    const person = makePerson({ id: 'abc-123', fullName: 'Vạn Công Trí', gender: Gender.enum.male, birthYear: 1958, birthMonth: 4, birthDay: 12 });
    const result = exportToGedcom({ persons: [person], relationships: [] });

    expect(result).toContain('0 @Iabc123@ INDI');
    expect(result).toContain('1 NAME Vạn Công /Trí/');
    expect(result).toContain('1 SEX M');
    expect(result).toContain('1 BIRT');
    expect(result).toContain('2 DATE 12 APR 1958');
  });

  it('exports female sex correctly', () => {
    const person = makePerson({ gender: Gender.enum.female });
    const result = exportToGedcom({ persons: [person], relationships: [] });
    expect(result).toContain('1 SEX F');
  });

  it('exports other sex as U', () => {
    const person = makePerson({ gender: Gender.enum.other });
    const result = exportToGedcom({ persons: [person], relationships: [] });
    expect(result).toContain('1 SEX U');
  });

  it('exports deceased person with death date', () => {
    const person = makePerson({ isDeceased: true, deathYear: 2020, deathMonth: 6, deathDay: 15 });
    const result = exportToGedcom({ persons: [person], relationships: [] });
    expect(result).toContain('1 DEAT Y');
    expect(result).toContain('2 DATE 15 JUN 2020');
  });

  it('exports multiline note with CONT tags', () => {
    const person = makePerson({ note: 'Line one\nLine two\nLine three' });
    const result = exportToGedcom({ persons: [person], relationships: [] });
    expect(result).toContain('1 NOTE Line one');
    expect(result).toContain('2 CONT Line two');
    expect(result).toContain('2 CONT Line three');
  });

  it('exports marriage as FAM record with HUSB and WIFE', () => {
    const husband = makePerson({ id: 'h-1', gender: Gender.enum.male });
    const wife = makePerson({ id: 'w-1', gender: Gender.enum.female });
    const marriage = makeRel({ type: RelationshipType.enum.marriage, personAId: husband.id, personBId: wife.id });

    const result = exportToGedcom({ persons: [husband, wife], relationships: [marriage] });
    expect(result).toContain('1 HUSB @Ih1@');
    expect(result).toContain('1 WIFE @Iw1@');
  });

  it('exports children in FAM record', () => {
    const parent = makePerson({ id: 'p-1', gender: Gender.enum.male });
    const child = makePerson({ id: 'c-1' });
    const rel = makeRel({ type: RelationshipType.enum.biological_child, personAId: parent.id, personBId: child.id });

    const result = exportToGedcom({ persons: [parent, child], relationships: [rel] });
    expect(result).toContain('1 CHIL @Ic1@');
  });

  it('handles person with no name', () => {
    const person = makePerson({ fullName: '' });
    const result = exportToGedcom({ persons: [person], relationships: [] });
    expect(result).toContain('1 NAME Unknown /Unknown/');
  });
});

describe('parseGedcom', () => {
  it('parses individual with name, sex, and birth date', () => {
    const gedcom = `0 HEAD
1 GEDC
2 VERS 7.0
0 @I1@ INDI
1 NAME Vạn Công /Trí/
1 SEX M
1 BIRT
2 DATE 12 APR 1958
0 TRLR`;

    const result = parseGedcom(gedcom);
    expect(result.persons).toHaveLength(1);
    expect(result.persons[0].fullName).toBe('Vạn Công Trí');
    expect(result.persons[0].gender).toBe(Gender.enum.male);
    expect(result.persons[0].birthYear).toBe(1958);
    expect(result.persons[0].birthMonth).toBe(4);
    expect(result.persons[0].birthDay).toBe(12);
  });

  it('parses female sex', () => {
    const gedcom = `0 HEAD
0 @I1@ INDI
1 NAME Test /Person/
1 SEX F
0 TRLR`;

    const result = parseGedcom(gedcom);
    expect(result.persons[0].gender).toBe(Gender.enum.female);
  });

  it('parses unknown sex as other', () => {
    const gedcom = `0 HEAD
0 @I1@ INDI
1 NAME Test /Person/
1 SEX U
0 TRLR`;

    const result = parseGedcom(gedcom);
    expect(result.persons[0].gender).toBe(Gender.enum.other);
  });

  it('parses deceased person with death date', () => {
    const gedcom = `0 HEAD
0 @I1@ INDI
1 NAME Test /Person/
1 SEX M
1 DEAT Y
2 DATE 15 JUN 2020
0 TRLR`;

    const result = parseGedcom(gedcom);
    expect(result.persons[0].isDeceased).toBe(true);
    expect(result.persons[0].deathYear).toBe(2020);
    expect(result.persons[0].deathMonth).toBe(6);
    expect(result.persons[0].deathDay).toBe(15);
  });

  it('parses family record with marriage and children', () => {
    const gedcom = `0 HEAD
0 @I1@ INDI
1 NAME Husband /Test/
1 SEX M
0 @I2@ INDI
1 NAME Wife /Test/
1 SEX F
0 @I3@ INDI
1 NAME Child /Test/
1 SEX M
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I3@
0 TRLR`;

    const result = parseGedcom(gedcom);
    expect(result.persons).toHaveLength(3);
    expect(result.relationships).toHaveLength(2);

    const marriage = result.relationships.find((r) => r.type === RelationshipType.enum.marriage);
    expect(marriage).toBeDefined();

    const childRel = result.relationships.find((r) => r.type === RelationshipType.enum.biological_child);
    expect(childRel).toBeDefined();
  });

  it('parses date with only year', () => {
    const gedcom = `0 HEAD
0 @I1@ INDI
1 NAME Test /Person/
1 SEX M
1 BIRT
2 DATE 1990
0 TRLR`;

    const result = parseGedcom(gedcom);
    expect(result.persons[0].birthYear).toBe(1990);
    expect(result.persons[0].birthMonth).toBeNull();
    expect(result.persons[0].birthDay).toBeNull();
  });

  it('parses date with ABT prefix', () => {
    const gedcom = `0 HEAD
0 @I1@ INDI
1 NAME Test /Person/
1 SEX M
1 BIRT
2 DATE ABT 1990
0 TRLR`;

    const result = parseGedcom(gedcom);
    expect(result.persons[0].birthYear).toBe(1990);
  });

  it('parses multiline note', () => {
    const gedcom = `0 HEAD
0 @I1@ INDI
1 NAME Test /Person/
1 SEX M
1 NOTE First line
2 CONT Second line
0 TRLR`;

    const result = parseGedcom(gedcom);
    expect(result.persons[0].note).toBe('First line\nSecond line');
  });

  it('handles empty gedcom', () => {
    const result = parseGedcom('0 HEAD\n0 TRLR');
    expect(result.persons).toHaveLength(0);
    expect(result.relationships).toHaveLength(0);
  });
});
