import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDbClient } from '../../lib/db';
import { updateBatch } from './lineage';

const mockRequireAuth = vi.fn();

vi.mock('./_auth', () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
  requireAdmin: vi.fn(),
}));

const prisma = getDbClient();

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAuth.mockResolvedValue({ id: 'user-1', isActive: true });
});

describe('updateBatch', () => {
  it('should return early for empty updates', async () => {
    const result = await updateBatch({ data: { updates: [] } });

    expect(result).toEqual({ success: true, updated: 0 });
  });

  it('should update generation and birthOrder for each person', async () => {
    const personA = await prisma.person.create({ data: { fullName: 'A', gender: 'male' } });
    const personB = await prisma.person.create({ data: { fullName: 'B', gender: 'female' } });

    const result = await updateBatch({
      data: {
        updates: [
          { id: personA.id, generation: 1, birthOrder: 1 },
          { id: personB.id, generation: 2, birthOrder: 2 },
        ],
      },
    });

    expect(result).toEqual({ success: true, updated: 2 });

    const updatedA = await prisma.person.findUnique({ where: { id: personA.id } });
    expect(updatedA?.generation).toBe(1);
    expect(updatedA?.birthOrder).toBe(1);

    const updatedB = await prisma.person.findUnique({ where: { id: personB.id } });
    expect(updatedB?.generation).toBe(2);
    expect(updatedB?.birthOrder).toBe(2);
  });

  it('should handle null values for generation and birthOrder', async () => {
    const person = await prisma.person.create({
      data: { fullName: 'Test', gender: 'male', generation: 5, birthOrder: 3 },
    });

    await updateBatch({
      data: {
        updates: [{ id: person.id, generation: null, birthOrder: null }],
      },
    });

    const updated = await prisma.person.findUnique({ where: { id: person.id } });
    expect(updated?.generation).toBeNull();
    expect(updated?.birthOrder).toBeNull();
  });

  it('should require authentication', async () => {
    mockRequireAuth.mockRejectedValue(new Error('Vui lòng đăng nhập.'));

    await expect(updateBatch({ data: { updates: [{ id: crypto.randomUUID(), generation: 1, birthOrder: 1 }] } })).rejects.toThrow('Vui lòng đăng nhập.');
  });
});
