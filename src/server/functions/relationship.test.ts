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
  relationship: {
    create: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

const { createRelationship, deleteRelationship, getRelationships, getRelationshipsForPerson } = await import('./relationship');

// ─── Helpers ────────────────────────────────────────────────────────────────

const UUID_A = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const UUID_B = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
const UUID_REL = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue({ id: 'user-1', isActive: true });
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('createRelationship', () => {
  it('should create a new relationship', async () => {
    const input = { type: 'marriage' as const, personAId: UUID_A, personBId: UUID_B };
    mockPrisma.relationship.findFirst.mockResolvedValue(null);
    mockPrisma.relationship.create.mockResolvedValue({ id: UUID_REL, ...input });

    const result = await createRelationship({ data: input });

    expect(result.id).toBe(UUID_REL);
    expect(mockPrisma.relationship.create).toHaveBeenCalledWith({ data: input });
  });

  it('should throw on self-relationship', async () => {
    await expect(createRelationship({ data: { type: 'marriage', personAId: UUID_A, personBId: UUID_A } })).rejects.toThrow(
      'Không thể tạo quan hệ với chính mình.'
    );
  });

  it('should throw on duplicate relationship', async () => {
    mockPrisma.relationship.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(createRelationship({ data: { type: 'marriage', personAId: UUID_A, personBId: UUID_B } })).rejects.toThrow('Mối quan hệ này đã tồn tại.');
  });

  it('should check both directions for duplicates', async () => {
    mockPrisma.relationship.findFirst.mockResolvedValue(null);
    mockPrisma.relationship.create.mockResolvedValue({ id: UUID_REL });

    await createRelationship({ data: { type: 'biological_child', personAId: UUID_A, personBId: UUID_B } });

    expect(mockPrisma.relationship.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { personAId: UUID_A, personBId: UUID_B, type: 'biological_child' },
          { personAId: UUID_B, personBId: UUID_A, type: 'biological_child' },
        ],
      },
    });
  });

  it('should throw when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(new Error('Vui lòng đăng nhập.'));

    await expect(createRelationship({ data: { type: 'marriage', personAId: UUID_A, personBId: UUID_B } })).rejects.toThrow('Vui lòng đăng nhập.');
  });
});

describe('deleteRelationship', () => {
  it('should delete a relationship', async () => {
    mockPrisma.relationship.delete.mockResolvedValue({});

    const result = await deleteRelationship({ data: { id: UUID_REL } });

    expect(result).toEqual({ success: true });
    expect(mockPrisma.relationship.delete).toHaveBeenCalledWith({ where: { id: UUID_REL } });
  });
});

describe('getRelationships', () => {
  it('should return all relationships', async () => {
    const rels = [{ id: UUID_REL, type: 'marriage' }];
    mockPrisma.relationship.findMany.mockResolvedValue(rels);

    const result = await getRelationships();

    expect(result).toEqual(rels);
  });
});

describe('getRelationshipsForPerson', () => {
  it('should return relationships involving the person', async () => {
    const rels = [{ id: UUID_REL, personAId: UUID_A, personBId: UUID_B }];
    mockPrisma.relationship.findMany.mockResolvedValue(rels);

    const result = await getRelationshipsForPerson({ data: { personId: UUID_A } });

    expect(result).toEqual(rels);
    expect(mockPrisma.relationship.findMany).toHaveBeenCalledWith({
      where: {
        OR: [{ personAId: UUID_A }, { personBId: UUID_A }],
      },
      orderBy: { createdAt: 'asc' },
    });
  });
});
