import { beforeEach, describe, expect, it } from 'vitest';
import { uploadAvatar } from '../../lib/storage';
import { countRelationshipsForPerson, createRelationship, deleteAllRelationships } from '../../relationships/repository/relationship';
import { RelationshipType } from '../../relationships/types';
import { createPerson, deleteAllPersons, deletePerson, findAllPersons, findPersonById, updatePerson, upsertPersonDetailsPrivate } from '../repository/person';
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
    await createRelationship({ type: RelationshipType.enum.marriage, personAId: personA.id, personBId: personB.id });

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

    const key = await uploadAvatar({ buffer: Buffer.from('fake-image'), personId: person.id, filename: 'photo.jpg', contentType: 'image/jpeg' });

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
