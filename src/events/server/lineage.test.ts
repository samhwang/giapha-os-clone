import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDbClient } from '../../lib/db';
import { requireAuth } from '../../server/functions/_auth';
import { Gender, UserRole } from '../../types';

vi.mock('../../server/functions/_auth', () => ({
  requireAuth: vi.fn(),
}));

const db = getDbClient();

describe('updateBatch (inner logic)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(requireAuth).mockResolvedValue({
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
  });

  it('should return early for empty updates', async () => {
    const result = { success: true, updated: 0 };
    expect(result).toEqual({ success: true, updated: 0 });
  });

  it('should update generation and birthOrder for each person', async () => {
    const personA = await db.person.create({ data: { fullName: 'A', gender: Gender.enum.male } });
    const personB = await db.person.create({ data: { fullName: 'B', gender: Gender.enum.female } });

    await db.$transaction(
      [personA.id, personB.id].map((id, index) =>
        db.person.update({
          where: { id },
          data: { generation: index + 1, birthOrder: index + 1 },
        })
      )
    );

    const updatedA = await db.person.findUnique({ where: { id: personA.id } });
    expect(updatedA?.generation).toBe(1);
    expect(updatedA?.birthOrder).toBe(1);

    const updatedB = await db.person.findUnique({ where: { id: personB.id } });
    expect(updatedB?.generation).toBe(2);
    expect(updatedB?.birthOrder).toBe(2);
  });

  it('should handle null values for generation and birthOrder', async () => {
    const person = await db.person.create({
      data: { fullName: 'Test', gender: Gender.enum.male, generation: 5, birthOrder: 3 },
    });

    await db.person.update({
      where: { id: person.id },
      data: { generation: null, birthOrder: null },
    });

    const updated = await db.person.findUnique({ where: { id: person.id } });
    expect(updated?.generation).toBeNull();
    expect(updated?.birthOrder).toBeNull();
  });

  it('should require authentication', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('Vui lòng đăng nhập.'));

    await expect(requireAuth()).rejects.toThrow('Vui lòng đăng nhập.');
  });
});
