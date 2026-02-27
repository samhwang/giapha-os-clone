import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDbClient } from '../../lib/db';
import { createPerson, deleteMember, getPersonById, getPersons, updatePerson, uploadPersonAvatar } from './member';

const mockRequireAuth = vi.fn();
const mockRequireAdmin = vi.fn();

vi.mock('./_auth', () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

const prisma = getDbClient();

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue({ id: 'user-1', role: 'admin', isActive: true });
  mockRequireAdmin.mockResolvedValue({ id: 'user-1', role: 'admin', isActive: true });
});

describe('createPerson', () => {
  it('should create a person without private details', async () => {
    const result = await createPerson({ data: { fullName: 'Nguyễn Văn A', gender: 'male' } });

    expect(result.fullName).toBe('Nguyễn Văn A');
    expect(result.gender).toBe('male');
    expect(result.id).toBeDefined();
    expect(result.privateDetails).toBeNull();
  });

  it('should create a person with private details', async () => {
    const result = await createPerson({
      data: {
        fullName: 'Nguyễn Văn B',
        gender: 'male',
        phoneNumber: '0901234567',
        occupation: 'Kỹ sư',
      },
    });

    expect(result.fullName).toBe('Nguyễn Văn B');
    expect(result.privateDetails).not.toBeNull();
    expect(result.privateDetails?.phoneNumber).toBe('0901234567');
    expect(result.privateDetails?.occupation).toBe('Kỹ sư');
    expect(result.privateDetails?.currentResidence).toBeNull();
  });

  it('should throw when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(new Error('Vui lòng đăng nhập.'));

    await expect(createPerson({ data: { fullName: 'Test', gender: 'male' } })).rejects.toThrow('Vui lòng đăng nhập.');
  });
});

describe('updatePerson', () => {
  it('should update person fields', async () => {
    const person = await createPerson({ data: { fullName: 'Original Name', gender: 'male' } });

    const result = await updatePerson({ data: { id: person.id, fullName: 'Updated Name' } });

    expect(result.fullName).toBe('Updated Name');
  });

  it('should upsert private details when provided', async () => {
    const person = await createPerson({ data: { fullName: 'Test Person', gender: 'female' } });

    const result = await updatePerson({ data: { id: person.id, phoneNumber: '0909999999' } });

    expect(result.privateDetails?.phoneNumber).toBe('0909999999');
  });
});

describe('deleteMember', () => {
  it('should delete a member with no relationships', async () => {
    const person = await createPerson({ data: { fullName: 'To Delete', gender: 'male' } });

    const result = await deleteMember({ data: { id: person.id } });

    expect(result).toEqual({ success: true });

    const found = await prisma.person.findUnique({ where: { id: person.id } });
    expect(found).toBeNull();
  });

  it('should throw when member has relationships', async () => {
    const personA = await createPerson({ data: { fullName: 'Person A', gender: 'male' } });
    const personB = await createPerson({ data: { fullName: 'Person B', gender: 'female' } });
    await prisma.relationship.create({
      data: { type: 'marriage', personAId: personA.id, personBId: personB.id },
    });

    await expect(deleteMember({ data: { id: personA.id } })).rejects.toThrow('error.member.hasRelationships');
  });

  it('should require admin role', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Từ chối truy cập. Chỉ admin mới có quyền này.'));
    const person = await createPerson({ data: { fullName: 'Test', gender: 'male' } });

    await expect(deleteMember({ data: { id: person.id } })).rejects.toThrow('Từ chối truy cập');
  });
});

describe('uploadPersonAvatar', () => {
  it('should upload avatar and update person', async () => {
    const person = await createPerson({ data: { fullName: 'Avatar Test', gender: 'male' } });

    const result = await uploadPersonAvatar({
      data: {
        personId: person.id,
        filename: 'photo.jpg',
        contentType: 'image/jpeg',
        base64: Buffer.from('fake-image-data').toString('base64'),
      },
    });

    expect(result.avatarUrl).toContain(`avatars/${person.id}/photo.jpg`);

    const dbPerson = await prisma.person.findUnique({ where: { id: person.id } });
    expect(dbPerson?.avatarUrl).toBe(result.avatarUrl);
  });

  it('should throw when person not found', async () => {
    await expect(
      uploadPersonAvatar({
        data: {
          personId: crypto.randomUUID(),
          filename: 'photo.jpg',
          contentType: 'image/jpeg',
          base64: Buffer.from('data').toString('base64'),
        },
      })
    ).rejects.toThrow('error.member.notFound');
  });
});

describe('getPersons', () => {
  it('should return created persons', async () => {
    const p1 = await createPerson({ data: { fullName: 'Person 1', gender: 'male' } });
    const p2 = await createPerson({ data: { fullName: 'Person 2', gender: 'female' } });

    const result = await getPersons();
    const ids = result.map((p: { id: string }) => p.id);

    expect(ids).toContain(p1.id);
    expect(ids).toContain(p2.id);
  });
});

describe('getPersonById', () => {
  it('should return person with private details', async () => {
    const person = await createPerson({
      data: {
        fullName: 'Test Person',
        gender: 'male',
        phoneNumber: '0901234567',
      },
    });

    const result = await getPersonById({ data: { id: person.id } });

    expect(result?.fullName).toBe('Test Person');
    expect(result?.privateDetails?.phoneNumber).toBe('0901234567');
  });

  it('should return null for non-existent person', async () => {
    const result = await getPersonById({ data: { id: crypto.randomUUID() } });
    expect(result).toBeNull();
  });
});
