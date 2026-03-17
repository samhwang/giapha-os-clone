import { beforeEach, describe, expect, it } from 'vitest';
import { UserRole } from '../../auth/types';
import { getDbClient } from '../../database/lib/client';
import { deleteAllUsers, deleteUser, findAllUsers, findUserByEmail, updateUser } from '../repository/user';

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

    const updated = await updateUser({ id: user.id, data: { role: UserRole.enum.editor } });

    expect(updated.role).toBe(UserRole.enum.editor);
  });
});

describe('deleteUser (inner logic)', () => {
  it('should delete user', async () => {
    const user = await seedUser();

    await deleteUser(user.id);

    const found = await findUserByEmail(user.email);
    expect(found).toBeNull();
  });
});

describe('toggleStatus (inner logic)', () => {
  it('should toggle user status to inactive', async () => {
    const user = await seedUser({ isActive: true });

    const updated = await updateUser({ id: user.id, data: { isActive: false } });

    expect(updated.isActive).toBe(false);
  });

  it('should toggle user status to active', async () => {
    const user = await seedUser({ isActive: false });

    const updated = await updateUser({ id: user.id, data: { isActive: true } });

    expect(updated.isActive).toBe(true);
  });
});

describe('getUsers (inner logic)', () => {
  beforeEach(async () => {
    await deleteAllUsers();
  });

  it('should return all users', async () => {
    await seedUser({ email: 'user1@test.com' });
    await seedUser({ email: 'user2@test.com' });

    const users = await findAllUsers();

    expect(users).toHaveLength(2);
  });
});
