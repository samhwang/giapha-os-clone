import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => {
    let validatorSchema: { parse?: (input: unknown) => unknown } | ((input: unknown) => unknown) | null = null;
    const builder = {
      validator: (schema: unknown) => {
        validatorSchema = schema as typeof validatorSchema;
        return builder;
      },
      handler: (fn: (opts: { data: unknown }) => unknown) => {
        const callable = async (input: unknown) => {
          let data = input;
          if (validatorSchema) {
            data = typeof validatorSchema === 'function' ? validatorSchema(input) : validatorSchema.parse?.(input);
          }
          return fn({ data });
        };
        return callable;
      },
    };
    return builder;
  }),
}));

const mockRequireAdmin = vi.fn();
vi.mock('./_auth', () => ({
  requireAuth: vi.fn(),
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

const mockTx = {
  relationship: { deleteMany: vi.fn(), createMany: vi.fn() },
  person: { deleteMany: vi.fn(), createMany: vi.fn() },
};

const mockPrisma = {
  person: { findMany: vi.fn() },
  relationship: { findMany: vi.fn() },
  $transaction: vi.fn(async (fn: (tx: typeof mockTx) => Promise<void>) => fn(mockTx)),
};

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

const { exportData, importData } = await import('./data');

// ─── Helpers ────────────────────────────────────────────────────────────────

const UUID_A = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_B = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAdmin.mockResolvedValue({ id: 'user-1', role: 'admin' });
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('exportData', () => {
  it('should return backup payload with persons and relationships', async () => {
    const persons = [{ id: UUID_A, fullName: 'Nguyễn Vạn' }];
    const relationships = [{ id: UUID_B, type: 'marriage' }];
    mockPrisma.person.findMany.mockResolvedValue(persons);
    mockPrisma.relationship.findMany.mockResolvedValue(relationships);

    const result = await exportData();

    expect(result.version).toBe(2);
    expect(result.timestamp).toBeDefined();
    expect(result.persons).toEqual(persons);
    expect(result.relationships).toEqual(relationships);
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

  it('should delete existing data and import new data in transaction', async () => {
    const result = await importData(validPayload);

    expect(result).toEqual({
      success: true,
      imported: { persons: 1, relationships: 1 },
    });
    expect(mockTx.relationship.deleteMany).toHaveBeenCalled();
    expect(mockTx.person.deleteMany).toHaveBeenCalled();
    expect(mockTx.person.createMany).toHaveBeenCalled();
    expect(mockTx.relationship.createMany).toHaveBeenCalled();
  });

  it('should reject empty persons array via Zod', async () => {
    await expect(
      importData({
        persons: [],
        relationships: [],
      })
    ).rejects.toThrow();
  });

  it('should sanitize person data on import', async () => {
    await importData(validPayload);

    const createManyCall = mockTx.person.createMany.mock.calls[0][0];
    expect(createManyCall.data[0]).toMatchObject({
      id: UUID_A,
      fullName: 'Nguyễn Vạn',
      gender: 'male',
      isDeceased: false,
      isInLaw: false,
    });
  });

  it('should require admin access', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('Từ chối truy cập.'));

    await expect(importData(validPayload)).rejects.toThrow('Từ chối truy cập.');
  });
});
