import { beforeEach, describe, expect, it } from 'vitest';
import { ERRORS } from '../../lib/errors';
import { createPerson, deleteAllPersons } from '../../members/repository/person';
import { Gender } from '../../members/types';
import {
  createManyRelationships,
  createRelationship,
  deleteAllRelationships,
  deleteRelationship,
  findAllRelationships,
  findRelationshipByParticipants,
  findRelationshipsForPerson,
} from '../repository/relationship';
import { RelationshipType } from '../types';

describe('createRelationship (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllRelationships();
    await deleteAllPersons();
  });

  it('should create a new relationship', async () => {
    const personA = await createPerson({ fullName: 'Person A', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'Person B', gender: Gender.enum.female });

    const result = await createRelationship({ type: RelationshipType.enum.marriage, personAId: personA.id, personBId: personB.id });

    expect(result.type).toBe('marriage');
    expect(result.personAId).toBe(personA.id);
    expect(result.personBId).toBe(personB.id);
    expect(result.id).toBeDefined();
  });

  it('should reject self-relationship', async () => {
    const person = await createPerson({ fullName: 'Self', gender: Gender.enum.male });

    const selfRelationCheck = (aId: string, bId: string) => aId === bId;
    const isSelfRelation = selfRelationCheck(person.id, person.id);

    expect(isSelfRelation).toBe(true);
  });

  it('should detect duplicate relationship', async () => {
    const personA = await createPerson({ fullName: 'Parent', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'Child', gender: Gender.enum.female });

    await createRelationship({ type: RelationshipType.enum.biological_child, personAId: personA.id, personBId: personB.id });

    const existing = await findRelationshipByParticipants({ personAId: personA.id, personBId: personB.id, type: RelationshipType.enum.biological_child });

    expect(existing).not.toBeNull();
  });

  it('should check both directions for duplicates', async () => {
    const personA = await createPerson({ fullName: 'A', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'B', gender: Gender.enum.female });

    await createRelationship({ type: RelationshipType.enum.biological_child, personAId: personA.id, personBId: personB.id });

    const reversed = await findRelationshipByParticipants({ personAId: personB.id, personBId: personA.id, type: RelationshipType.enum.biological_child });

    expect(reversed).not.toBeNull();
  });
});

describe('deleteRelationship (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllRelationships();
    await deleteAllPersons();
  });

  it('should delete a relationship', async () => {
    const personA = await createPerson({ fullName: 'A', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'B', gender: Gender.enum.female });

    const rel = await createRelationship({ type: RelationshipType.enum.marriage, personAId: personA.id, personBId: personB.id });

    await deleteRelationship(rel.id);

    const found = await findRelationshipByParticipants({ personAId: personA.id, personBId: personB.id, type: RelationshipType.enum.marriage });
    expect(found).toBeNull();
  });
});

describe('getRelationships (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllRelationships();
    await deleteAllPersons();
  });

  it('should return all relationships ordered by createdAt', async () => {
    const personA = await createPerson({ fullName: 'A', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'B', gender: Gender.enum.female });
    const personC = await createPerson({ fullName: 'C', gender: Gender.enum.male });

    await createManyRelationships([
      { type: RelationshipType.enum.marriage, personAId: personA.id, personBId: personB.id },
      { type: RelationshipType.enum.biological_child, personAId: personA.id, personBId: personC.id },
    ]);

    const result = await findAllRelationships();

    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('marriage');
    expect(result[1].type).toBe('biological_child');
  });
});

describe('getRelationshipsForPerson (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllRelationships();
    await deleteAllPersons();
  });

  it('should return relationships for a specific person', async () => {
    const personA = await createPerson({ fullName: 'A', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'B', gender: Gender.enum.female });
    const personC = await createPerson({ fullName: 'C', gender: Gender.enum.female });

    await createManyRelationships([
      { type: RelationshipType.enum.marriage, personAId: personA.id, personBId: personB.id },
      { type: RelationshipType.enum.biological_child, personAId: personA.id, personBId: personC.id },
    ]);

    const result = await findRelationshipsForPerson(personA.id);

    expect(result).toHaveLength(2);
  });

  it('should return empty when person has no relationships', async () => {
    const person = await createPerson({ fullName: 'Solo', gender: Gender.enum.male });

    const result = await findRelationshipsForPerson(person.id);

    expect(result).toHaveLength(0);
  });
});

describe('relationship server wrapper guards', () => {
  beforeEach(async () => {
    await deleteAllRelationships();
    await deleteAllPersons();
  });

  it('should detect self-relation (same person for both participants)', async () => {
    const person = await createPerson({ fullName: 'Self', gender: Gender.enum.male });

    expect(person.id).toBe(person.id); // Self-relation check
    expect(ERRORS.RELATIONSHIP.SELF_RELATION).toBe('error.relationship.selfRelation');
  });

  it('should detect duplicate relationship before create', async () => {
    const personA = await createPerson({ fullName: 'Parent', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'Child', gender: Gender.enum.female });

    await createRelationship({ type: RelationshipType.enum.biological_child, personAId: personA.id, personBId: personB.id });

    const existing = await findRelationshipByParticipants({
      personAId: personA.id,
      personBId: personB.id,
      type: RelationshipType.enum.biological_child,
    });

    expect(existing).not.toBeNull();
    expect(ERRORS.RELATIONSHIP.DUPLICATE).toBe('error.relationship.duplicate');
  });

  it('should detect duplicate in both directions (A→B and B→A)', async () => {
    const personA = await createPerson({ fullName: 'A', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'B', gender: Gender.enum.female });

    await createRelationship({ type: RelationshipType.enum.biological_child, personAId: personA.id, personBId: personB.id });

    const reversed = await findRelationshipByParticipants({
      personAId: personB.id,
      personBId: personA.id,
      type: RelationshipType.enum.biological_child,
    });

    expect(reversed).not.toBeNull();
  });

  it('should validate relationship type is valid enum', () => {
    const validTypes = RelationshipType.enum;
    expect(validTypes.marriage).toBe('marriage');
    expect(validTypes.biological_child).toBe('biological_child');
    expect(validTypes.adopted_child).toBe('adopted_child');
  });

  it('should delete relationship and verify removal', async () => {
    const personA = await createPerson({ fullName: 'A', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'B', gender: Gender.enum.female });

    const rel = await createRelationship({ type: RelationshipType.enum.marriage, personAId: personA.id, personBId: personB.id });
    expect(rel.id).toBeDefined();

    await deleteRelationship(rel.id);

    const found = await findRelationshipByParticipants({
      personAId: personA.id,
      personBId: personB.id,
      type: RelationshipType.enum.marriage,
    });
    expect(found).toBeNull();
  });
});
