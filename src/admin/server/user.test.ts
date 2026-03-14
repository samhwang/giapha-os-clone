import { beforeEach, describe, expect, it } from 'vitest';
import { getDbClient } from '../../lib/db';
import { UserRole } from '../../types';

const db = getDbClient();

async function seedUser(overrides: { id?: string; email?: string; role?: UserRole; isActive?: boolean } = {}) {
  const id = overrides.id ?? crypto.randomUUID();
  const data = {
    email: overrides.email ?? `user-${crypto.randomUUID()}@test.com`,
    name: 'Test User',
    role: overrides.role ?? UserRole.enum.member,
    isActive: overrides.isActive ?? true,
  };

  return db.user.upsert({
    where: { id },
    create: { id, ...data },
    update: data,
  });
}

describe('changeRole (inner logic)', () => {
  it('should update user role', async () => {
    const user = await seedUser({ role: UserRole.enum.member });

    const updated = await db.user.update({
      where: { id: user.id },
      data: { role: UserRole.enum.editor },
    });

    expect(updated.role).toBe(UserRole.enum.editor);
  });
});

describe('deleteUser (inner logic)', () => {
  it('should delete user', async () => {
    const user = await seedUser();

    await db.user.delete({ where: { id: user.id } });

    const found = await db.user.findUnique({ where: { id: user.id } });
    expect(found).toBeNull();
  });
});

describe('toggleStatus (inner logic)', () => {
  it('should toggle user status to inactive', async () => {
    const user = await seedUser({ isActive: true });

    const updated = await db.user.update({
      where: { id: user.id },
      data: { isActive: false },
    });

    expect(updated.isActive).toBe(false);
  });

  it('should toggle user status to active', async () => {
    const user = await seedUser({ isActive: false });

    const updated = await db.user.update({
      where: { id: user.id },
      data: { isActive: true },
    });

    expect(updated.isActive).toBe(true);
  });
});

describe('getUsers (inner logic)', () => {
  beforeEach(async () => {
    await db.user.deleteMany({});
  });

  it('should return all users', async () => {
    await seedUser({ email: 'user1@test.com' });
    await seedUser({ email: 'user2@test.com' });

    const users = await db.user.findMany({
      select: { id: true, email: true, role: true, isActive: true },
    });

    expect(users).toHaveLength(2);
  });
});
