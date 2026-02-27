import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDbClient } from '@/lib/db';
import { cleanDatabase } from '@/test-utils/db-helpers';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockRequireAdmin = vi.fn();

vi.mock('./_auth', () => ({
  requireAuth: vi.fn(),
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

// ─── Imports ────────────────────────────────────────────────────────────────

const { exportDataHandler, importDataHandler } = await import('./data');

const prisma = getDbClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

const UUID_A = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_B = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

// ─── Setup ──────────────────────────────────────────────────────────────────

beforeEach(async () => {
  vi.clearAllMocks();
  mockRequireAdmin.mockResolvedValue({ id: 'user-1', role: 'admin' });
  await cleanDatabase();
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('exportDataHandler', () => {
  it('should return backup payload with persons and relationships', async () => {
    await prisma.person.create({ data: { id: UUID_A, fullName: 'Nguyễn Vạn', gender: 'male' } });
    await prisma.person.create({ data: { id: UUID_B, fullName: 'Trần Thị', gender: 'female' } });
    await prisma.relationship.create({
      data: { type: 'marriage', personAId: UUID_A, personBId: UUID_B },
    });

    const result = await exportDataHandler();

    expect(result.version).toBe(2);
    expect(result.timestamp).toBeDefined();
    expect(result.persons).toHaveLength(2);
    expect(result.relationships).toHaveLength(1);
  });

  it('should require admin access', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Từ chối truy cập.'));

    await expect(exportDataHandler()).rejects.toThrow('Từ chối truy cập.');
  });
});

describe('importDataHandler', () => {
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

    const result = await importDataHandler(validPayload);

    expect(result).toEqual({
      success: true,
      imported: { persons: 2, relationships: 1 },
    });

    const persons = await prisma.person.findMany();
    expect(persons).toHaveLength(2);
  });

  it('should handle import with only persons (no relationships)', async () => {
    const result = await importDataHandler({
      persons: [{ id: UUID_A, fullName: 'Solo', gender: 'male', isDeceased: false, isInLaw: false }],
      relationships: [],
    });

    expect(result.imported.persons).toBe(1);
    expect(result.imported.relationships).toBe(0);
  });

  it('should require admin access', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Từ chối truy cập.'));

    await expect(importDataHandler(validPayload)).rejects.toThrow('Từ chối truy cập.');
  });
});
