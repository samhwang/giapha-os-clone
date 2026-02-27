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
      inputValidator: (schema: unknown) => {
        validatorSchema = schema as typeof validatorSchema;
        return builder;
      },
      handler: (fn: (opts: { data: unknown }) => unknown) => {
        const callable = async (input: unknown) => {
          let data = (input as { data?: unknown })?.data ?? input;
          if (validatorSchema) {
            data = typeof validatorSchema === 'function' ? validatorSchema(data) : validatorSchema.parse?.(data);
          }
          return fn({ data });
        };
        return callable;
      },
    };
    return builder;
  }),
}));

const mockRequireAuth = vi.fn();
vi.mock('./_auth', () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
  requireAdmin: vi.fn(),
}));

const mockPrisma = {
  person: {
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

const { updateBatch } = await import('./lineage');

// ─── Helpers ────────────────────────────────────────────────────────────────

const UUID_A = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_B = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue({ id: 'user-1', isActive: true });
  mockPrisma.$transaction.mockResolvedValue([]);
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('updateBatch', () => {
  it('should return early for empty updates', async () => {
    const result = await updateBatch({ data: { updates: [] } });

    expect(result).toEqual({ success: true, updated: 0 });
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('should run batch update in a transaction', async () => {
    const updates = [
      { id: UUID_A, generation: 1, birthOrder: 1 },
      { id: UUID_B, generation: 2, birthOrder: 2 },
    ];

    const result = await updateBatch({ data: { updates } });

    expect(result).toEqual({ success: true, updated: 2 });
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('should update generation and birthOrder for each person', async () => {
    const updates = [{ id: UUID_A, generation: 3, birthOrder: null }];

    await updateBatch({ data: { updates } });

    expect(mockPrisma.person.update).toHaveBeenCalledWith({
      where: { id: UUID_A },
      data: { generation: 3, birthOrder: null },
    });
  });

  it('should require authentication', async () => {
    mockRequireAuth.mockRejectedValue(new Error('Vui lòng đăng nhập.'));

    await expect(updateBatch({ data: { updates: [{ id: UUID_A, generation: 1, birthOrder: 1 }] } })).rejects.toThrow('Vui lòng đăng nhập.');
  });
});
