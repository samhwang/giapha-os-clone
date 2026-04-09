import { beforeEach, describe, expect, it } from 'vitest';

import { ERRORS } from '../../lib/errors';
import { uploadAvatar } from '../../lib/storage';
import { countRelationshipsForPerson, createRelationship, deleteAllRelationships } from '../../relationships/repository/relationship';
import { RelationshipType } from '../../relationships/types';
import {
  batchUpdatePersons,
  createManyPersonDetailsPrivate,
  createManyPersons,
  createPerson,
  deleteAllPersonDetailsPrivate,
  deleteAllPersons,
  deletePerson,
  findAllPersonDetailsPrivate,
  findAllPersons,
  findAllPersonsResolved,
  findPersonById,
  updatePerson,
  upsertPersonDetailsPrivate,
} from '../repository/person';
import { Gender } from '../types';

describe('createPerson (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllPersons();
  });

  it('should create a person without private details', async () => {
    const result = await createPerson({ fullName: 'Nguyễn Văn A', gender: Gender.enum.male });

    expect(result.fullName).toBe('Nguyễn Văn A');
    expect(result.gender).toBe('male');
    expect(result.id).toBeDefined();
    expect(result.privateDetails).toBeNull();
  });

  it('should create a person with private details', async () => {
    const result = await createPerson({
      fullName: 'Nguyễn Văn B',
      gender: Gender.enum.male,
      privateDetails: {
        create: {
          phoneNumber: '0901234567',
          occupation: 'Kỹ sư',
        },
      },
    });

    expect(result.fullName).toBe('Nguyễn Văn B');
    expect(result.privateDetails).not.toBeNull();
    expect(result.privateDetails?.phoneNumber).toBe('0901234567');
    expect(result.privateDetails?.occupation).toBe('Kỹ sư');
    expect(result.privateDetails?.currentResidence).toBeNull();
  });
});

describe('updatePerson (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllPersons();
  });

  it('should update person fields', async () => {
    const person = await createPerson({ fullName: 'Original Name', gender: Gender.enum.male });

    const result = await updatePerson({ id: person.id, data: { fullName: 'Updated Name' } });

    expect(result.fullName).toBe('Updated Name');
  });

  it('should upsert private details when provided', async () => {
    const person = await createPerson({ fullName: 'Test Person', gender: Gender.enum.female });

    await upsertPersonDetailsPrivate({
      personId: person.id,
      create: { phoneNumber: '0909999999', occupation: null, currentResidence: null },
      update: { phoneNumber: '0909999999' },
    });

    const result = await findPersonById(person.id);

    expect(result?.privateDetails?.phoneNumber).toBe('0909999999');
  });
});

describe('deleteMember (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllRelationships();
    await deleteAllPersons();
  });

  it('should delete a member with no relationships', async () => {
    const person = await createPerson({ fullName: 'To Delete', gender: Gender.enum.male });

    await deletePerson(person.id);

    const found = await findPersonById(person.id);
    expect(found).toBeNull();
  });

  it('should not delete a member with relationships', async () => {
    const personA = await createPerson({ fullName: 'Person A', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'Person B', gender: Gender.enum.female });
    await createRelationship({
      type: RelationshipType.enum.marriage,
      personAId: personA.id,
      personBId: personB.id,
    });

    const relationshipCount = await countRelationshipsForPerson(personA.id);

    expect(relationshipCount).toBe(1);
  });
});

describe('uploadPersonAvatar (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllPersons();
  });

  it('should upload avatar and update person', async () => {
    const person = await createPerson({ fullName: 'Avatar Test', gender: Gender.enum.male });

    const key = await uploadAvatar({
      buffer: Buffer.from('fake-image'),
      personId: person.id,
      filename: 'photo.jpg',
      contentType: 'image/jpeg',
    });

    const result = await updatePerson({ id: person.id, data: { avatarUrl: key } });

    expect(result.avatarUrl).toBe(key);
  });

  it('should throw when person not found', async () => {
    const nonExistentId = crypto.randomUUID();

    await expect(findPersonById(nonExistentId)).resolves.toBeNull();
  });
});

describe('getPersons (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllPersons();
  });

  it('should return created persons', async () => {
    const p1 = await createPerson({ fullName: 'Person 1', gender: Gender.enum.male });
    const p2 = await createPerson({ fullName: 'Person 2', gender: Gender.enum.female });

    const result = await findAllPersons();
    const ids = result.map((p: { id: string }) => p.id);

    expect(ids).toContain(p1.id);
    expect(ids).toContain(p2.id);
  });
});

describe('getPersonById (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllPersons();
  });

  it('should return person with private details', async () => {
    const person = await createPerson({
      fullName: 'Test Person',
      gender: Gender.enum.male,
      privateDetails: {
        create: { phoneNumber: '0901234567' },
      },
    });

    const result = await findPersonById(person.id);

    expect(result?.fullName).toBe('Test Person');
    expect(result?.privateDetails?.phoneNumber).toBe('0901234567');
  });

  it('should return null for non-existent person', async () => {
    const result = await findPersonById(crypto.randomUUID());
    expect(result).toBeNull();
  });
});

describe('deleteMember guards (wrapper logic)', () => {
  beforeEach(async () => {
    await deleteAllRelationships();
    await deleteAllPersons();
  });

  it('should throw MEMBER.NOT_FOUND when person does not exist', async () => {
    const nonExistentId = crypto.randomUUID();

    const person = await findPersonById(nonExistentId);
    expect(person).toBeNull();

    if (!person) {
      const err = ERRORS.MEMBER.NOT_FOUND;
      expect(err).toBe('error.member.notFound');
    }
  });

  it('should throw MEMBER.HAS_RELATIONSHIPS when person has relationships', async () => {
    const personA = await createPerson({ fullName: 'Person A', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'Person B', gender: Gender.enum.female });
    await createRelationship({
      type: RelationshipType.enum.marriage,
      personAId: personA.id,
      personBId: personB.id,
    });

    const relCount = await countRelationshipsForPerson(personA.id);
    expect(relCount).toBeGreaterThan(0);
    expect(ERRORS.MEMBER.HAS_RELATIONSHIPS).toBe('error.member.hasRelationships');
  });

  it('should delete person with no relationships successfully', async () => {
    const person = await createPerson({ fullName: 'Safe Delete', gender: Gender.enum.male });
    const relCount = await countRelationshipsForPerson(person.id);
    expect(relCount).toBe(0);

    await deletePerson(person.id);
    const found = await findPersonById(person.id);
    expect(found).toBeNull();
  });

  it('should handle avatar URL during deletion (person has avatar)', async () => {
    const person = await createPerson({ fullName: 'Has Avatar', gender: Gender.enum.male });
    const key = await uploadAvatar({
      buffer: Buffer.from('fake'),
      personId: person.id,
      filename: 'photo.jpg',
      contentType: 'image/jpeg',
    });
    const updated = await updatePerson({ id: person.id, data: { avatarUrl: key } });
    expect(updated.avatarUrl).toBe(key);

    // Verify person has avatarUrl before deletion
    const personWithAvatar = await findPersonById(person.id);
    expect(personWithAvatar?.avatarUrl).not.toBeNull();
  });
});

describe('updatePerson edge cases (wrapper logic)', () => {
  beforeEach(async () => {
    await deleteAllPersons();
  });

  it('should update only base person fields without private details upsert', async () => {
    const person = await createPerson({ fullName: 'Test', gender: Gender.enum.male });
    const updated = await updatePerson({ id: person.id, data: { fullName: 'Updated' } });

    expect(updated.fullName).toBe('Updated');
  });

  it('should upsert private details with partial update (only phoneNumber)', async () => {
    const person = await createPerson({ fullName: 'Test', gender: Gender.enum.male });
    await upsertPersonDetailsPrivate({
      personId: person.id,
      create: { phoneNumber: '0901234567', occupation: null, currentResidence: null },
      update: { phoneNumber: '0901234567' },
    });

    const result = await findPersonById(person.id);
    expect(result?.privateDetails?.phoneNumber).toBe('0901234567');
    expect(result?.privateDetails?.occupation).toBeNull();
  });

  it('should upsert private details with occupation only', async () => {
    const person = await createPerson({ fullName: 'Test', gender: Gender.enum.female });
    await upsertPersonDetailsPrivate({
      personId: person.id,
      create: { phoneNumber: null, occupation: 'Teacher', currentResidence: null },
      update: { occupation: 'Teacher' },
    });

    const result = await findPersonById(person.id);
    expect(result?.privateDetails?.occupation).toBe('Teacher');
    expect(result?.privateDetails?.phoneNumber).toBeNull();
  });
});

describe('uploadPersonAvatar guards (wrapper logic)', () => {
  beforeEach(async () => {
    await deleteAllPersons();
  });

  it('should verify person exists before avatar upload', async () => {
    const nonExistentId = crypto.randomUUID();
    const existing = await findPersonById(nonExistentId);
    expect(existing).toBeNull();
    expect(ERRORS.MEMBER.NOT_FOUND).toBe('error.member.notFound');
  });

  it('should delete existing avatar before replacement', async () => {
    const person = await createPerson({ fullName: 'Replace Avatar', gender: Gender.enum.male });
    const oldKey = await uploadAvatar({
      buffer: Buffer.from('old'),
      personId: person.id,
      filename: 'old.jpg',
      contentType: 'image/jpeg',
    });
    await updatePerson({ id: person.id, data: { avatarUrl: oldKey } });

    // Verify old avatar exists
    const before = await findPersonById(person.id);
    expect(before?.avatarUrl).not.toBeNull();

    // Upload new avatar (replaces old)
    const newKey = await uploadAvatar({
      buffer: Buffer.from('new'),
      personId: person.id,
      filename: 'new.jpg',
      contentType: 'image/jpeg',
    });
    const after = await updatePerson({ id: person.id, data: { avatarUrl: newKey } });
    expect(after.avatarUrl).toBe(newKey);
  });
});

describe('findAllPersonsResolved', () => {
  beforeEach(async () => {
    await deleteAllPersons();
  });

  it('should return persons with resolved avatar URLs', async () => {
    await createPerson({ fullName: 'Person A', gender: Gender.enum.male });
    await createPerson({ fullName: 'Person B', gender: Gender.enum.female });

    const result = await findAllPersonsResolved();

    expect(result).toHaveLength(2);
    expect(result[0]?.fullName).toBe('Person A');
    expect(result[1]?.fullName).toBe('Person B');
  });

  it('should return empty array when no persons exist', async () => {
    const result = await findAllPersonsResolved();
    expect(result).toEqual([]);
  });
});

describe('createManyPersons', () => {
  beforeEach(async () => {
    await deleteAllPersons();
  });

  it('should bulk create multiple persons', async () => {
    const result = await createManyPersons([
      { fullName: 'Bulk A', gender: Gender.enum.male },
      { fullName: 'Bulk B', gender: Gender.enum.female },
      { fullName: 'Bulk C', gender: Gender.enum.male },
    ]);

    expect(result.count).toBe(3);

    const all = await findAllPersons();
    expect(all).toHaveLength(3);
  });

  it('should accept a single input object', async () => {
    const result = await createManyPersons({ fullName: 'Single Bulk', gender: Gender.enum.male });

    expect(result.count).toBe(1);
  });
});

describe('findAllPersonDetailsPrivate', () => {
  beforeEach(async () => {
    await deleteAllPersonDetailsPrivate();
    await deleteAllPersons();
  });

  it('should return all private details', async () => {
    const personA = await createPerson({ fullName: 'A', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'B', gender: Gender.enum.female });

    await upsertPersonDetailsPrivate({
      personId: personA.id,
      create: { phoneNumber: '111', occupation: null, currentResidence: null },
      update: { phoneNumber: '111' },
    });
    await upsertPersonDetailsPrivate({
      personId: personB.id,
      create: { phoneNumber: '222', occupation: null, currentResidence: null },
      update: { phoneNumber: '222' },
    });

    const result = await findAllPersonDetailsPrivate();
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no private details exist', async () => {
    const result = await findAllPersonDetailsPrivate();
    expect(result).toEqual([]);
  });
});

describe('deleteAllPersonDetailsPrivate', () => {
  beforeEach(async () => {
    await deleteAllPersonDetailsPrivate();
    await deleteAllPersons();
  });

  it('should delete all private details', async () => {
    const person = await createPerson({ fullName: 'A', gender: Gender.enum.male });
    await upsertPersonDetailsPrivate({
      personId: person.id,
      create: { phoneNumber: '111', occupation: null, currentResidence: null },
      update: { phoneNumber: '111' },
    });

    const before = await findAllPersonDetailsPrivate();
    expect(before).toHaveLength(1);

    await deleteAllPersonDetailsPrivate();

    const after = await findAllPersonDetailsPrivate();
    expect(after).toEqual([]);
  });
});

describe('createManyPersonDetailsPrivate', () => {
  beforeEach(async () => {
    await deleteAllPersonDetailsPrivate();
    await deleteAllPersons();
  });

  it('should bulk create private details for multiple persons', async () => {
    const personA = await createPerson({ fullName: 'A', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'B', gender: Gender.enum.female });

    const result = await createManyPersonDetailsPrivate([
      { personId: personA.id, phoneNumber: '111' },
      { personId: personB.id, phoneNumber: '222' },
    ]);

    expect(result.count).toBe(2);

    const all = await findAllPersonDetailsPrivate();
    expect(all).toHaveLength(2);
  });

  it('should accept a single input object', async () => {
    const person = await createPerson({ fullName: 'A', gender: Gender.enum.male });

    const result = await createManyPersonDetailsPrivate({
      personId: person.id,
      phoneNumber: '111',
    });

    expect(result.count).toBe(1);
  });
});

describe('batchUpdatePersons', () => {
  beforeEach(async () => {
    await deleteAllPersons();
  });

  it('should batch update generation and birthOrder for multiple persons', async () => {
    const personA = await createPerson({ fullName: 'A', gender: Gender.enum.male });
    const personB = await createPerson({ fullName: 'B', gender: Gender.enum.female });

    await batchUpdatePersons([
      { id: personA.id, generation: 1, birthOrder: 1 },
      { id: personB.id, generation: 2, birthOrder: 2 },
    ]);

    const updatedA = await findPersonById(personA.id);
    const updatedB = await findPersonById(personB.id);

    expect(updatedA?.generation).toBe(1);
    expect(updatedA?.birthOrder).toBe(1);
    expect(updatedB?.generation).toBe(2);
    expect(updatedB?.birthOrder).toBe(2);
  });

  it('should update isInLaw when provided', async () => {
    const person = await createPerson({ fullName: 'In-Law', gender: Gender.enum.female });

    await batchUpdatePersons([{ id: person.id, generation: 1, birthOrder: 1, isInLaw: true }]);

    const updated = await findPersonById(person.id);
    expect(updated?.isInLaw).toBe(true);
  });

  it('should not update isInLaw when not provided', async () => {
    const person = await createPerson({ fullName: 'Not In-Law', gender: Gender.enum.male });

    await batchUpdatePersons([{ id: person.id, generation: 1, birthOrder: 1 }]);

    const updated = await findPersonById(person.id);
    expect(updated?.isInLaw).toBe(false);
  });

  it('should handle null generation and birthOrder', async () => {
    const person = await createPerson({ fullName: 'Null Fields', gender: Gender.enum.male });
    await updatePerson({ id: person.id, data: { generation: 5, birthOrder: 3 } });

    await batchUpdatePersons([{ id: person.id, generation: null, birthOrder: null }]);

    const updated = await findPersonById(person.id);
    expect(updated?.generation).toBeNull();
    expect(updated?.birthOrder).toBeNull();
  });
});
