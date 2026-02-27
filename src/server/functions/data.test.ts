import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDbClient } from '../../lib/db';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockRequireAdmin = vi.fn();

vi.mock('./_auth', () => ({
  requireAuth: vi.fn(),
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

import { exportData, importData } from './data';

const prisma = getDbClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

const UUID_A = crypto.randomUUID();
const UUID_B = crypto.randomUUID();

// ─── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAdmin.mockResolvedValue({ id: 'user-1', role: 'admin' });
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('exportData', () => {
  it('should return backup payload with persons and relationships', async () => {
    await prisma.person.create({ data: { id: UUID_A, fullName: 'Nguyễn Vạn', gender: 'male' } });
    await prisma.person.create({ data: { id: UUID_B, fullName: 'Trần Thị', gender: 'female' } });
    await prisma.relationship.create({
      data: { type: 'marriage', personAId: UUID_A, personBId: UUID_B },
    });

    const result = await exportData();

    expect(result.version).toBe(2);
    expect(result.timestamp).toBeDefined();
    expect(result.persons.map((p: { id: string }) => p.id)).toEqual(expect.arrayContaining([UUID_A, UUID_B]));
    expect(result.relationships).toEqual(expect.arrayContaining([expect.objectContaining({ personAId: UUID_A, personBId: UUID_B, type: 'marriage' })]));
  });

  it('should require admin access', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Từ chối truy cập.'));

    await expect(exportData()).rejects.toThrow('Từ chối truy cập.');
  });
});

describe('importData', () => {
  const validPayload = {
    version: 2,
    persons: [
      {
        id: UUID_A,
        fullName: 'Nguyễn Vạn',
        gender: 'male' as const,
        isDeceased: false,
        isInLaw: false,
      },
      {
        id: UUID_B,
        fullName: 'Nguyễn Thị',
        gender: 'female' as const,
        isDeceased: false,
        isInLaw: false,
      },
    ],
    relationships: [
      {
        type: 'biological_child' as const,
        personAId: UUID_A,
        personBId: UUID_B,
      },
    ],
  };

  it('should delete existing data and import new data', async () => {
    // Seed some existing data that will be replaced
    await prisma.person.create({ data: { fullName: 'Old Person', gender: 'male' } });

    const result = await importData({ data: validPayload });

    expect(result).toEqual({
      success: true,
      imported: { persons: 2, relationships: 1 },
    });

    const personA = await prisma.person.findUnique({ where: { id: UUID_A } });
    const personB = await prisma.person.findUnique({ where: { id: UUID_B } });
    expect(personA?.fullName).toBe('Nguyễn Vạn');
    expect(personB?.fullName).toBe('Nguyễn Thị');
  });

  it('should handle import with only persons (no relationships)', async () => {
    const result = await importData({
      data: {
        persons: [{ id: UUID_A, fullName: 'Solo', gender: 'male', isDeceased: false, isInLaw: false }],
        relationships: [],
      },
    });

    expect(result.imported.persons).toBe(1);
    expect(result.imported.relationships).toBe(0);
  });

  it('should require admin access', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Từ chối truy cập.'));

    await expect(importData({ data: validPayload })).rejects.toThrow('Từ chối truy cập.');
  });
});
