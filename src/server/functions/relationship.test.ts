import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDbClient } from '@/lib/db';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockRequireAuth = vi.fn();

vi.mock('./_auth', () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
  requireAdmin: vi.fn(),
}));

import { createRelationship, deleteRelationship, getRelationships, getRelationshipsForPerson } from './relationship';

const prisma = getDbClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

async function seedPerson(name: string, gender: 'male' | 'female' = 'male') {
  return prisma.person.create({ data: { fullName: name, gender } });
}

// ─── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue({ id: 'user-1', isActive: true });
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('createRelationship', () => {
  it('should create a new relationship', async () => {
    const personA = await seedPerson('Person A');
    const personB = await seedPerson('Person B', 'female');

    const result = await createRelationship({
      data: {
        type: 'marriage',
        personAId: personA.id,
        personBId: personB.id,
      },
    });

    expect(result.type).toBe('marriage');
    expect(result.personAId).toBe(personA.id);
    expect(result.personBId).toBe(personB.id);
    expect(result.id).toBeDefined();
  });

  it('should throw on self-relationship', async () => {
    const person = await seedPerson('Self');

    await expect(createRelationship({ data: { type: 'marriage', personAId: person.id, personBId: person.id } })).rejects.toThrow(
      'error.relationship.selfRelation'
    );
  });

  it('should throw on duplicate relationship', async () => {
    const personA = await seedPerson('Parent');
    const personB = await seedPerson('Child');

    await createRelationship({ data: { type: 'biological_child', personAId: personA.id, personBId: personB.id } });

    await expect(createRelationship({ data: { type: 'biological_child', personAId: personA.id, personBId: personB.id } })).rejects.toThrow(
      'error.relationship.duplicate'
    );
  });

  it('should check both directions for duplicates', async () => {
    const personA = await seedPerson('A');
    const personB = await seedPerson('B');

    await createRelationship({ data: { type: 'biological_child', personAId: personA.id, personBId: personB.id } });

    // Reversed direction should also be detected as duplicate
    await expect(createRelationship({ data: { type: 'biological_child', personAId: personB.id, personBId: personA.id } })).rejects.toThrow(
      'error.relationship.duplicate'
    );
  });

  it('should throw when not authenticated', async () => {
    mockRequireAuth.mockRejectedValue(new Error('Vui lòng đăng nhập.'));

    await expect(
      createRelationship({
        data: {
          type: 'marriage',
          personAId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          personBId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        },
      })
    ).rejects.toThrow('Vui lòng đăng nhập.');
  });
});

describe('deleteRelationship', () => {
  it('should delete a relationship', async () => {
    const personA = await seedPerson('A');
    const personB = await seedPerson('B');
    const rel = await createRelationship({ data: { type: 'marriage', personAId: personA.id, personBId: personB.id } });

    const result = await deleteRelationship({ data: { id: rel.id } });

    expect(result).toEqual({ success: true });
    const found = await prisma.relationship.findUnique({ where: { id: rel.id } });
    expect(found).toBeNull();
  });
});

describe('getRelationships', () => {
  it('should return created relationships', async () => {
    const personA = await seedPerson('A');
    const personB = await seedPerson('B');
    const rel = await createRelationship({ data: { type: 'marriage', personAId: personA.id, personBId: personB.id } });

    const result = await getRelationships();
    const ids = result.map((r: { id: string }) => r.id);

    expect(ids).toContain(rel.id);
  });
});

describe('getRelationshipsForPerson', () => {
  it('should return relationships involving the person', async () => {
    const personA = await seedPerson('A');
    const personB = await seedPerson('B');
    const personC = await seedPerson('C');
    await createRelationship({ data: { type: 'marriage', personAId: personA.id, personBId: personB.id } });
    await createRelationship({ data: { type: 'biological_child', personAId: personA.id, personBId: personC.id } });

    const result = await getRelationshipsForPerson({ data: { personId: personA.id } });

    expect(result).toHaveLength(2);
  });

  it('should not return unrelated relationships', async () => {
    const personA = await seedPerson('A');
    const personB = await seedPerson('B');
    const personC = await seedPerson('C');
    await createRelationship({ data: { type: 'marriage', personAId: personA.id, personBId: personB.id } });

    const result = await getRelationshipsForPerson({ data: { personId: personC.id } });

    expect(result).toEqual([]);
  });
});
