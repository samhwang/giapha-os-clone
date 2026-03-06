import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDbClient } from '../../lib/db';
import { requireAdmin } from '../../server/functions/_auth';
import { Gender, RelationshipType, UserRole } from '../../types';

vi.mock('../../server/functions/_auth', () => ({
  requireAdmin: vi.fn(),
}));

const db = getDbClient();

describe('exportData (inner logic)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({
      id: 'user-1',
      role: UserRole.enum.admin,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'test@test.com',
      emailVerified: true,
      name: 'Test',
    });
    await db.person.deleteMany({});
    await db.relationship.deleteMany({});
  });

  it('should return backup payload with persons and relationships', async () => {
    const personA = await db.person.create({ data: { fullName: 'Nguyễn Vạn', gender: Gender.enum.male } });
    const personB = await db.person.create({ data: { fullName: 'Trần Thị', gender: Gender.enum.female } });
    await db.relationship.create({
      data: { type: RelationshipType.enum.marriage, personAId: personA.id, personBId: personB.id },
    });

    const persons = await db.person.findMany({ orderBy: { createdAt: 'asc' } });
    const relationships = await db.relationship.findMany({ orderBy: { createdAt: 'asc' } });

    expect(persons).toHaveLength(2);
    expect(relationships).toHaveLength(1);
    expect(relationships[0].type).toBe('marriage');
  });

  it('should return backup payload with correct structure', async () => {
    await db.person.create({ data: { fullName: 'Test', gender: Gender.enum.male } });

    const persons = await db.person.findMany();
    const relationships = await db.relationship.findMany();

    expect(persons[0]).toHaveProperty('id');
    expect(persons[0]).toHaveProperty('fullName');
    expect(persons[0]).toHaveProperty('gender');
    expect(relationships).toHaveLength(0);
  });

  it('should require admin access', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error('Từ chối truy cập.'));

    await expect(requireAdmin()).rejects.toThrow('Từ chối truy cập.');
  });
});

describe('importData (inner logic)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({
      id: 'user-1',
      role: UserRole.enum.admin,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'test@test.com',
      emailVerified: true,
      name: 'Test',
    });
    await db.person.deleteMany({});
    await db.relationship.deleteMany({});
  });

  it('should delete existing data and import new data', async () => {
    await db.person.create({ data: { fullName: 'Old Person', gender: Gender.enum.male } });

    await db.person.deleteMany({});

    const personA = await db.person.create({ data: { fullName: 'Nguyễn Vạn', gender: Gender.enum.male } });
    const personB = await db.person.create({ data: { fullName: 'Nguyễn Thị', gender: Gender.enum.female } });
    await db.relationship.create({
      data: { type: RelationshipType.enum.biological_child, personAId: personA.id, personBId: personB.id },
    });

    const persons = await db.person.findMany();
    const relationships = await db.relationship.findMany();

    const oldPerson = await db.person.findFirst({ where: { fullName: 'Old Person' } });
    expect(oldPerson).toBeNull();

    expect(persons).toHaveLength(2);
    expect(relationships).toHaveLength(1);
  });

  it('should handle import with empty data as no-op', async () => {
    await db.person.deleteMany({});
    await db.relationship.deleteMany({});

    const persons = await db.person.findMany();
    const relationships = await db.relationship.findMany();

    expect(persons).toHaveLength(0);
    expect(relationships).toHaveLength(0);
  });

  it('should handle import with only persons (no relationships)', async () => {
    await db.person.create({ data: { fullName: 'Solo', gender: Gender.enum.male } });

    const persons = await db.person.findMany();
    const relationships = await db.relationship.findMany();

    expect(persons).toHaveLength(1);
    expect(relationships).toHaveLength(0);
  });

  it('should require admin access', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error('Từ chối truy cập.'));

    await expect(requireAdmin()).rejects.toThrow('Từ chối truy cập.');
  });
});
