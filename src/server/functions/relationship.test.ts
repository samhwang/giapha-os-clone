import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDbClient } from '@/lib/db';
import { cleanDatabase } from '@/test-utils/db-helpers';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockRequireAuth = vi.fn();

vi.mock('./_auth', () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
  requireAdmin: vi.fn(),
}));

// ─── Imports ────────────────────────────────────────────────────────────────

const { createRelationshipHandler, deleteRelationshipHandler, getRelationshipsHandler, getRelationshipsForPersonHandler } = await import('./relationship');

const prisma = getDbClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

async function seedPerson(name: string, gender: 'male' | 'female' = 'male') {
  return prisma.person.create({ data: { fullName: name, gender } });
}

// ─── Setup ──────────────────────────────────────────────────────────────────

beforeEach(async () => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue({ id: 'user-1', isActive: true });
  await cleanDatabase();
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('createRelationshipHandler', () => {
  it('should create a new relationship', async () => {
    const personA = await seedPerson('Person A');
    const personB = await seedPerson('Person B', 'female');

    const result = await createRelationshipHandler({
      type: 'marriage',
      personAId: personA.id,
      personBId: personB.id,
    });

    expect(result.type).toBe('marriage');
    expect(result.personAId).toBe(personA.id);
    expect(result.personBId).toBe(personB.id);
    expect(result.id).toBeDefined();
  });

  it('should throw on self-relationship', async () => {
    const person = await seedPerson('Self');

    await expect(createRelationshipHandler({ type: 'marriage', personAId: person.id, personBId: person.id })).rejects.toThrow(
      'Không thể tạo quan hệ với chính mình.'
    );
  });

  it('should throw on duplicate relationship', async () => {
    const personA = await seedPerson('Parent');
    const personB = await seedPerson('Child');

    await createRelationshipHandler({ type: 'biological_child', personAId: personA.id, personBId: personB.id });

    await expect(createRelationshipHandler({ type: 'biological_child', personAId: personA.id, personBId: personB.id })).rejects.toThrow(
      'Mối quan hệ này đã tồn tại.'
    );
  });

  it('should check both directions for duplicates', async () => {
    const personA = await seedPerson('A');
    const personB = await seedPerson('B');

    await createRelationshipHandler({ type: 'biological_child', personAId: personA.id, personBId: personB.id });

    // Reversed direction should also be detected as duplicate
    await expect(createRelationshipHandler({ type: 'biological_child', personAId: personB.id, personBId: personA.id })).rejects.toThrow(
      'Mối quan hệ này đã tồn tại.'
    );
  });

  it('should throw when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(new Error('Vui lòng đăng nhập.'));

    await expect(
      createRelationshipHandler({
        type: 'marriage',
        personAId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        personBId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      })
    ).rejects.toThrow('Vui lòng đăng nhập.');
  });
});

describe('deleteRelationshipHandler', () => {
  it('should delete a relationship', async () => {
    const personA = await seedPerson('A');
    const personB = await seedPerson('B');
    const rel = await createRelationshipHandler({ type: 'marriage', personAId: personA.id, personBId: personB.id });

    const result = await deleteRelationshipHandler({ id: rel.id });

    expect(result).toEqual({ success: true });
    const found = await prisma.relationship.findUnique({ where: { id: rel.id } });
    expect(found).toBeNull();
  });
});

describe('getRelationshipsHandler', () => {
  it('should return all relationships', async () => {
    const personA = await seedPerson('A');
    const personB = await seedPerson('B');
    await createRelationshipHandler({ type: 'marriage', personAId: personA.id, personBId: personB.id });

    const result = await getRelationshipsHandler();

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('marriage');
  });

  it('should return empty array when no relationships', async () => {
    const result = await getRelationshipsHandler();
    expect(result).toEqual([]);
  });
});

describe('getRelationshipsForPersonHandler', () => {
  it('should return relationships involving the person', async () => {
    const personA = await seedPerson('A');
    const personB = await seedPerson('B');
    const personC = await seedPerson('C');
    await createRelationshipHandler({ type: 'marriage', personAId: personA.id, personBId: personB.id });
    await createRelationshipHandler({ type: 'biological_child', personAId: personA.id, personBId: personC.id });

    const result = await getRelationshipsForPersonHandler({ personId: personA.id });

    expect(result).toHaveLength(2);
  });

  it('should not return unrelated relationships', async () => {
    const personA = await seedPerson('A');
    const personB = await seedPerson('B');
    const personC = await seedPerson('C');
    await createRelationshipHandler({ type: 'marriage', personAId: personA.id, personBId: personB.id });

    const result = await getRelationshipsForPersonHandler({ personId: personC.id });

    expect(result).toEqual([]);
  });
});
