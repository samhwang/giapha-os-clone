import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDbClient } from '../../lib/db';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockRequireAdmin = vi.fn();

vi.mock('./_auth', () => ({
  requireAuth: vi.fn(),
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

const mockSignUpEmail = vi.fn();
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      signUpEmail: (...args: unknown[]) => mockSignUpEmail(...args),
    },
  },
}));

import { changeRole, createUser, deleteUser, getUsers, toggleStatus } from './user';

const prisma = getDbClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

const ADMIN_ID = crypto.randomUUID();

async function seedUser(overrides: { id?: string; email?: string; role?: 'admin' | 'member'; isActive?: boolean } = {}) {
  const id = overrides.id ?? crypto.randomUUID();
  const data = {
    email: overrides.email ?? `user-${crypto.randomUUID()}@test.com`,
    name: 'Test User',
    role: overrides.role ?? 'member',
    isActive: overrides.isActive ?? true,
  };

  return prisma.user.upsert({
    where: { id },
    create: { id, ...data },
    update: data,
  });
}

// ─── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireAdmin.mockResolvedValue({ id: ADMIN_ID, role: 'admin' });
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('changeRole', () => {
  it('should change another user role', async () => {
    const user = await seedUser({ role: 'member' });

    const result = await changeRole({ data: { userId: user.id, newRole: 'admin' } });

    expect(result).toEqual({ success: true });
    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated?.role).toBe('admin');
  });

  it('should prevent changing own role', async () => {
    await seedUser({ id: ADMIN_ID, role: 'admin' });

    await expect(changeRole({ data: { userId: ADMIN_ID, newRole: 'member' } })).rejects.toThrow('error.user.selfRole');
  });
});

describe('deleteUser', () => {
  it('should delete another user', async () => {
    const user = await seedUser();

    const result = await deleteUser({ data: { userId: user.id } });

    expect(result).toEqual({ success: true });
    const found = await prisma.user.findUnique({ where: { id: user.id } });
    expect(found).toBeNull();
  });

  it('should prevent self-deletion', async () => {
    await seedUser({ id: ADMIN_ID });

    await expect(deleteUser({ data: { userId: ADMIN_ID } })).rejects.toThrow('error.user.selfDelete');
  });
});

describe('createUser', () => {
  it('should create a new user via Better Auth signup', async () => {
    const newUserId = crypto.randomUUID();
    mockSignUpEmail.mockResolvedValue({ user: { id: newUserId } });
    // Pre-create the user record that Better Auth would create
    await seedUser({ id: newUserId, email: 'will-be-overridden@test.com' });

    const result = await createUser({
      data: {
        email: 'new@test.com',
        password: 'password123',
        role: 'member',
        isActive: true,
      },
    });

    expect(result).toEqual({ success: true });
    expect(mockSignUpEmail).toHaveBeenCalledWith({
      body: { email: 'new@test.com', password: 'password123', name: 'new@test.com' },
    });
  });

  it('should throw when email already exists', async () => {
    const email = `existing-${crypto.randomUUID()}@test.com`;
    await seedUser({ email });

    await expect(createUser({ data: { email, password: 'password123' } })).rejects.toThrow('error.user.emailTaken');
  });
});

describe('toggleStatus', () => {
  it('should toggle another user status', async () => {
    const user = await seedUser({ isActive: true });

    const result = await toggleStatus({ data: { userId: user.id, isActive: false } });

    expect(result).toEqual({ success: true });
    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated?.isActive).toBe(false);
  });

  it('should prevent toggling own status', async () => {
    await seedUser({ id: ADMIN_ID });

    await expect(toggleStatus({ data: { userId: ADMIN_ID, isActive: false } })).rejects.toThrow('error.user.selfStatus');
  });
});

describe('getUsers', () => {
  it('should return users with selected fields', async () => {
    const email1 = `user1-${crypto.randomUUID()}@test.com`;
    const email2 = `user2-${crypto.randomUUID()}@test.com`;
    await seedUser({ email: email1, role: 'admin' });
    await seedUser({ email: email2, role: 'member' });

    const result = await getUsers();
    const emails = result.map((u: { email: string }) => u.email);

    expect(emails).toContain(email1);
    expect(emails).toContain(email2);
    expect(result[0]).toHaveProperty('email');
    expect(result[0]).toHaveProperty('role');
    expect(result[0]).not.toHaveProperty('emailVerified');
  });
});
