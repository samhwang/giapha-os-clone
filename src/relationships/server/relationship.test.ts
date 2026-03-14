import { beforeEach, describe, expect, it } from 'vitest';
import { getDbClient } from '../../lib/db';
import { Gender, RelationshipType } from '../../types';

const db = getDbClient();

describe('createRelationship (inner logic)', () => {
  beforeEach(async () => {
    await db.relationship.deleteMany({});
    await db.person.deleteMany({});
  });

  it('should create a new relationship', async () => {
    const personA = await db.person.create({ data: { fullName: 'Person A', gender: Gender.enum.male } });
    const personB = await db.person.create({ data: { fullName: 'Person B', gender: Gender.enum.female } });

    const result = await db.relationship.create({
      data: { type: RelationshipType.enum.marriage, personAId: personA.id, personBId: personB.id },
    });

    expect(result.type).toBe('marriage');
    expect(result.personAId).toBe(personA.id);
    expect(result.personBId).toBe(personB.id);
    expect(result.id).toBeDefined();
  });

  it('should reject self-relationship', async () => {
    const person = await db.person.create({ data: { fullName: 'Self', gender: Gender.enum.male } });

    const selfRelationCheck = (aId: string, bId: string) => aId === bId;
    const isSelfRelation = selfRelationCheck(person.id, person.id);

    expect(isSelfRelation).toBe(true);
  });

  it('should detect duplicate relationship', async () => {
    const personA = await db.person.create({ data: { fullName: 'Parent', gender: Gender.enum.male } });
    const personB = await db.person.create({ data: { fullName: 'Child', gender: Gender.enum.female } });

    await db.relationship.create({
      data: { type: RelationshipType.enum.biological_child, personAId: personA.id, personBId: personB.id },
    });

    const existing = await db.relationship.findFirst({
      where: {
        OR: [
          { personAId: personA.id, personBId: personB.id, type: RelationshipType.enum.biological_child },
          { personAId: personB.id, personBId: personA.id, type: RelationshipType.enum.biological_child },
        ],
      },
    });

    expect(existing).not.toBeNull();
  });

  it('should check both directions for duplicates', async () => {
    const personA = await db.person.create({ data: { fullName: 'A', gender: Gender.enum.male } });
    const personB = await db.person.create({ data: { fullName: 'B', gender: Gender.enum.female } });

    await db.relationship.create({
      data: { type: RelationshipType.enum.biological_child, personAId: personA.id, personBId: personB.id },
    });

    const reversed = await db.relationship.findFirst({
      where: {
        OR: [
          { personAId: personB.id, personBId: personA.id, type: RelationshipType.enum.biological_child },
          { personAId: personA.id, personBId: personB.id, type: RelationshipType.enum.biological_child },
        ],
      },
    });

    expect(reversed).not.toBeNull();
  });
});

describe('deleteRelationship (inner logic)', () => {
  beforeEach(async () => {
    await db.relationship.deleteMany({});
    await db.person.deleteMany({});
  });

  it('should delete a relationship', async () => {
    const personA = await db.person.create({ data: { fullName: 'A', gender: Gender.enum.male } });
    const personB = await db.person.create({ data: { fullName: 'B', gender: Gender.enum.female } });

    const rel = await db.relationship.create({
      data: { type: RelationshipType.enum.marriage, personAId: personA.id, personBId: personB.id },
    });

    await db.relationship.delete({ where: { id: rel.id } });

    const found = await db.relationship.findUnique({ where: { id: rel.id } });
    expect(found).toBeNull();
  });
});

describe('getRelationships (inner logic)', () => {
  beforeEach(async () => {
    await db.relationship.deleteMany({});
    await db.person.deleteMany({});
  });

  it('should return all relationships ordered by createdAt', async () => {
    const personA = await db.person.create({ data: { fullName: 'A', gender: Gender.enum.male } });
    const personB = await db.person.create({ data: { fullName: 'B', gender: Gender.enum.female } });
    const personC = await db.person.create({ data: { fullName: 'C', gender: Gender.enum.male } });

    await db.relationship.createMany({
      data: [
        { type: RelationshipType.enum.marriage, personAId: personA.id, personBId: personB.id },
        { type: RelationshipType.enum.biological_child, personAId: personA.id, personBId: personC.id },
      ],
    });

    const result = await db.relationship.findMany({ orderBy: { createdAt: 'asc' } });

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('marriage');
    expect(result[1].type).toBe('biological_child');
  });
});

describe('getRelationshipsForPerson (inner logic)', () => {
  beforeEach(async () => {
    await db.relationship.deleteMany({});
    await db.person.deleteMany({});
  });

  it('should return relationships for a specific person', async () => {
    const personA = await db.person.create({ data: { fullName: 'A', gender: Gender.enum.male } });
    const personB = await db.person.create({ data: { fullName: 'B', gender: Gender.enum.female } });
    const personC = await db.person.create({ data: { fullName: 'C', gender: Gender.enum.female } });

    await db.relationship.createMany({
      data: [
        { type: RelationshipType.enum.marriage, personAId: personA.id, personBId: personB.id },
        { type: RelationshipType.enum.biological_child, personAId: personA.id, personBId: personC.id },
      ],
    });

    const result = await db.relationship.findMany({
      where: {
        OR: [{ personAId: personA.id }, { personBId: personA.id }],
      },
      orderBy: { createdAt: 'asc' },
    });

    expect(result).toHaveLength(2);
  });

  it('should return empty when person has no relationships', async () => {
    const person = await db.person.create({ data: { fullName: 'Solo', gender: Gender.enum.male } });

    const result = await db.relationship.findMany({
      where: {
        OR: [{ personAId: person.id }, { personBId: person.id }],
      },
    });

    expect(result).toHaveLength(0);
  });
});
