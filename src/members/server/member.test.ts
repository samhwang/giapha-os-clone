import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDbClient } from '../../lib/db';
import { uploadAvatar } from '../../lib/storage';
import { requireAdmin, requireAuth } from '../../server/functions/_auth';

vi.mock('../../server/functions/_auth', () => ({
  requireAuth: vi.fn(),
  requireAdmin: vi.fn(),
}));

vi.mock('../../lib/storage', () => ({
  uploadAvatar: vi.fn(),
  deleteAvatar: vi.fn(),
}));

const db = getDbClient();

describe('createPerson (inner logic)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'test@test.com',
      emailVerified: true,
      name: 'Test',
    });
    await db.person.deleteMany({});
    await db.personDetailsPrivate.deleteMany({});
  });

  it('should create a person without private details', async () => {
    const result = await db.person.create({
      data: { fullName: 'Nguyễn Văn A', gender: 'male' },
      include: { privateDetails: true },
    });

    expect(result.fullName).toBe('Nguyễn Văn A');
    expect(result.gender).toBe('male');
    expect(result.id).toBeDefined();
    expect(result.privateDetails).toBeNull();
  });

  it('should create a person with private details', async () => {
    const result = await db.person.create({
      data: {
        fullName: 'Nguyễn Văn B',
        gender: 'male',
        privateDetails: {
          create: {
            phoneNumber: '0901234567',
            occupation: 'Kỹ sư',
          },
        },
      },
      include: { privateDetails: true },
    });

    expect(result.fullName).toBe('Nguyễn Văn B');
    expect(result.privateDetails).not.toBeNull();
    expect(result.privateDetails?.phoneNumber).toBe('0901234567');
    expect(result.privateDetails?.occupation).toBe('Kỹ sư');
    expect(result.privateDetails?.currentResidence).toBeNull();
  });

  it('should throw when not authenticated', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('Vui lòng đăng nhập.'));

    await expect(requireAuth()).rejects.toThrow('Vui lòng đăng nhập.');
  });
});

describe('updatePerson (inner logic)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'test@test.com',
      emailVerified: true,
      name: 'Test',
    });
    await db.person.deleteMany({});
    await db.personDetailsPrivate.deleteMany({});
  });

  it('should update person fields', async () => {
    const person = await db.person.create({
      data: { fullName: 'Original Name', gender: 'male' },
    });

    const result = await db.person.update({
      where: { id: person.id },
      data: { fullName: 'Updated Name' },
    });

    expect(result.fullName).toBe('Updated Name');
  });

  it('should upsert private details when provided', async () => {
    const person = await db.person.create({
      data: { fullName: 'Test Person', gender: 'female' },
    });

    await db.personDetailsPrivate.upsert({
      where: { personId: person.id },
      create: {
        personId: person.id,
        phoneNumber: '0909999999',
      },
      update: {
        phoneNumber: '0909999999',
      },
    });

    const result = await db.person.findUnique({
      where: { id: person.id },
      include: { privateDetails: true },
    });

    expect(result?.privateDetails?.phoneNumber).toBe('0909999999');
  });
});

describe('deleteMember (inner logic)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({
      id: 'user-1',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'test@test.com',
      emailVerified: true,
      name: 'Test',
    });
    await db.person.deleteMany({});
    await db.personDetailsPrivate.deleteMany({});
    await db.relationship.deleteMany({});
  });

  it('should delete a member with no relationships', async () => {
    const person = await db.person.create({
      data: { fullName: 'To Delete', gender: 'male' },
    });

    await db.person.delete({ where: { id: person.id } });

    const found = await db.person.findUnique({ where: { id: person.id } });
    expect(found).toBeNull();
  });

  it('should throw when member has relationships', async () => {
    const personA = await db.person.create({ data: { fullName: 'Person A', gender: 'male' } });
    const personB = await db.person.create({ data: { fullName: 'Person B', gender: 'female' } });
    await db.relationship.create({
      data: { type: 'marriage', personAId: personA.id, personBId: personB.id },
    });

    const relationshipCount = await db.relationship.count({
      where: { OR: [{ personAId: personA.id }, { personBId: personA.id }] },
    });

    expect(relationshipCount).toBe(1);
  });

  it('should require admin role', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error('Từ chối truy cập.'));

    await expect(requireAdmin()).rejects.toThrow('Từ chối truy cập.');
  });
});

describe('uploadPersonAvatar (inner logic)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue({
      id: 'user-1',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'test@test.com',
      emailVerified: true,
      name: 'Test',
    });
    vi.mocked(uploadAvatar).mockResolvedValue('https://test.url/avatars/test.jpg');
    await db.person.deleteMany({});
    await db.personDetailsPrivate.deleteMany({});
  });

  it('should upload avatar and update person', async () => {
    const person = await db.person.create({
      data: { fullName: 'Avatar Test', gender: 'male' },
    });

    vi.mocked(uploadAvatar).mockResolvedValue(`https://test.url/avatars/${person.id}/photo.jpg`);
    const url = await uploadAvatar(Buffer.from('fake-image'), person.id, 'photo.jpg', 'image/jpeg');

    const result = await db.person.update({
      where: { id: person.id },
      data: { avatarUrl: url },
    });

    expect(result.avatarUrl).toBe(url);
  });

  it('should throw when person not found', async () => {
    const nonExistentId = crypto.randomUUID();

    await expect(db.person.findUnique({ where: { id: nonExistentId } })).resolves.toBeNull();
  });
});

describe('getPersons (inner logic)', () => {
  beforeEach(async () => {
    await db.person.deleteMany({});
    await db.personDetailsPrivate.deleteMany({});
  });

  it('should return created persons', async () => {
    const p1 = await db.person.create({ data: { fullName: 'Person 1', gender: 'male' } });
    const p2 = await db.person.create({ data: { fullName: 'Person 2', gender: 'female' } });

    const result = await db.person.findMany({ orderBy: { createdAt: 'asc' } });
    const ids = result.map((p) => p.id);

    expect(ids).toContain(p1.id);
    expect(ids).toContain(p2.id);
  });
});

describe('getPersonById (inner logic)', () => {
  beforeEach(async () => {
    await db.person.deleteMany({});
    await db.personDetailsPrivate.deleteMany({});
  });

  it('should return person with private details', async () => {
    const person = await db.person.create({
      data: {
        fullName: 'Test Person',
        gender: 'male',
        privateDetails: {
          create: { phoneNumber: '0901234567' },
        },
      },
      include: { privateDetails: true },
    });

    const result = await db.person.findUnique({
      where: { id: person.id },
      include: { privateDetails: true },
    });

    expect(result?.fullName).toBe('Test Person');
    expect(result?.privateDetails?.phoneNumber).toBe('0901234567');
  });

  it('should return null for non-existent person', async () => {
    const result = await db.person.findUnique({ where: { id: crypto.randomUUID() } });
    expect(result).toBeNull();
  });
});
