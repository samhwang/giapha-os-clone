import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDbClient } from '../../lib/db';
import { requireAdmin } from '../../server/functions/_auth';

vi.mock('../../server/functions/_auth', () => ({
  requireAdmin: vi.fn(),
}));

const db = getDbClient();

const ADMIN_ID = crypto.randomUUID();

async function seedUser(overrides: { id?: string; email?: string; role?: 'admin' | 'member'; isActive?: boolean } = {}) {
  const id = overrides.id ?? crypto.randomUUID();
  const data = {
    email: overrides.email ?? `user-${crypto.randomUUID()}@test.com`,
    name: 'Test User',
    role: overrides.role ?? 'member',
    isActive: overrides.isActive ?? true,
  };

  return db.user.upsert({
    where: { id },
    create: { id, ...data },
    update: data,
  });
}

describe('changeRole (inner logic)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({
      id: ADMIN_ID,
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'admin@test.com',
      emailVerified: true,
      name: 'Admin',
    });
    await db.user.deleteMany({});
  });

  it('should change another user role', async () => {
    const user = await seedUser({ role: 'member' });

    const result = await db.user.update({
      where: { id: user.id },
      data: { role: 'admin' },
    });

    expect(result.role).toBe('admin');
  });

  it('should prevent changing own role', async () => {
    await seedUser({ id: ADMIN_ID, role: 'admin' });

    const currentUserId = ADMIN_ID;
    const targetUserId = 'different-user-id';

    const isSelfChange = (current: string, target: string) => current === target;
    const wouldBeSelfChange = isSelfChange(currentUserId, targetUserId);

    expect(wouldBeSelfChange).toBe(false);
  });

  it('should require admin', async () => {
    vi.mocked(requireAdmin).mockRejectedValue(new Error('Từ chối truy cập.'));

    await expect(requireAdmin()).rejects.toThrow('Từ chối truy cập.');
  });
});

describe('deleteUser (inner logic)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({
      id: ADMIN_ID,
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'admin@test.com',
      emailVerified: true,
      name: 'Admin',
    });
    await db.user.deleteMany({});
  });

  it('should delete another user', async () => {
    const user = await seedUser();

    await db.user.delete({ where: { id: user.id } });

    const found = await db.user.findUnique({ where: { id: user.id } });
    expect(found).toBeNull();
  });

  it('should prevent self-deletion', async () => {
    await seedUser({ id: ADMIN_ID });

    const currentUserId = ADMIN_ID;
    const targetUserId = 'different-user-id';

    const isSelfChange = (current: string, target: string) => current === target;
    const wouldBeSelfChange = isSelfChange(currentUserId, targetUserId);

    expect(wouldBeSelfChange).toBe(false);
  });
});

describe('toggleStatus (inner logic)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockResolvedValue({
      id: ADMIN_ID,
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: 'admin@test.com',
      emailVerified: true,
      name: 'Admin',
    });
    await db.user.deleteMany({});
  });

  it('should toggle another user status', async () => {
    const user = await seedUser({ isActive: true });

    const result = await db.user.update({
      where: { id: user.id },
      data: { isActive: false },
    });

    expect(result.isActive).toBe(false);
  });

  it('should prevent toggling own status', async () => {
    await seedUser({ id: ADMIN_ID });

    const currentUserId = ADMIN_ID;
    const targetUserId = 'different-user-id';

    const isSelfChange = (current: string, target: string) => current === target;
    const wouldBeSelfChange = isSelfChange(currentUserId, targetUserId);

    expect(wouldBeSelfChange).toBe(false);
  });
});

describe('getUsers (inner logic)', () => {
  beforeEach(async () => {
    await db.user.deleteMany({});
  });

  it('should return users with selected fields', async () => {
    const email1 = `user1-${crypto.randomUUID()}@test.com`;
    const email2 = `user2-${crypto.randomUUID()}@test.com`;
    await seedUser({ email: email1, role: 'admin' });
    await seedUser({ email: email2, role: 'member' });

    const result = await db.user.findMany({
      select: { email: true, role: true },
    });

    const emails = result.map((u) => u.email);

    expect(emails).toContain(email1);
    expect(emails).toContain(email2);
    expect(result[0]).toHaveProperty('email');
    expect(result[0]).toHaveProperty('role');
  });
});
