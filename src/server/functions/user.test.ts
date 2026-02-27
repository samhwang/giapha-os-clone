import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDbClient } from '@/lib/db';
import { cleanDatabase, cleanUsers } from '@/test-utils/db-helpers';

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

// ─── Imports ────────────────────────────────────────────────────────────────

const { changeRoleHandler, deleteUserHandler, createUserHandler, toggleStatusHandler, getUsersHandler } = await import('./user');

const prisma = getDbClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

const ADMIN_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

async function seedUser(overrides: { id?: string; email?: string; role?: 'admin' | 'member'; isActive?: boolean } = {}) {
  return prisma.user.create({
    data: {
      id: overrides.id ?? crypto.randomUUID(),
      email: overrides.email ?? `user-${crypto.randomUUID()}@test.com`,
      name: 'Test User',
      role: overrides.role ?? 'member',
      isActive: overrides.isActive ?? true,
    },
  });
}

// ─── Setup ──────────────────────────────────────────────────────────────────

beforeEach(async () => {
  vi.clearAllMocks();
  mockRequireAdmin.mockResolvedValue({ id: ADMIN_ID, role: 'admin' });
  await cleanDatabase();
  await cleanUsers();
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('changeRoleHandler', () => {
  it('should change another user role', async () => {
    const user = await seedUser({ role: 'member' });

    const result = await changeRoleHandler({ userId: user.id, newRole: 'admin' });

    expect(result).toEqual({ success: true });
    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated?.role).toBe('admin');
  });

  it('should prevent changing own role', async () => {
    await seedUser({ id: ADMIN_ID, role: 'admin' });

    await expect(changeRoleHandler({ userId: ADMIN_ID, newRole: 'member' })).rejects.toThrow('Không thể thay đổi vai trò của chính mình.');
  });
});

describe('deleteUserHandler', () => {
  it('should delete another user', async () => {
    const user = await seedUser();

    const result = await deleteUserHandler({ userId: user.id });

    expect(result).toEqual({ success: true });
    const found = await prisma.user.findUnique({ where: { id: user.id } });
    expect(found).toBeNull();
  });

  it('should prevent self-deletion', async () => {
    await seedUser({ id: ADMIN_ID });

    await expect(deleteUserHandler({ userId: ADMIN_ID })).rejects.toThrow('Không thể xoá tài khoản của chính mình.');
  });
});

describe('createUserHandler', () => {
  it('should create a new user via Better Auth signup', async () => {
    const newUserId = crypto.randomUUID();
    mockSignUpEmail.mockResolvedValue({ user: { id: newUserId } });
    // Pre-create the user record that Better Auth would create
    await seedUser({ id: newUserId, email: 'will-be-overridden@test.com' });

    const result = await createUserHandler({
      email: 'new@test.com',
      password: 'password123',
      role: 'member',
      isActive: true,
    });

    expect(result).toEqual({ success: true });
    expect(mockSignUpEmail).toHaveBeenCalledWith({
      body: { email: 'new@test.com', password: 'password123', name: 'new@test.com' },
    });
  });

  it('should throw when email already exists', async () => {
    await seedUser({ email: 'existing@test.com' });

    await expect(createUserHandler({ email: 'existing@test.com', password: 'password123' })).rejects.toThrow('Email đã được sử dụng.');
  });
});

describe('toggleStatusHandler', () => {
  it('should toggle another user status', async () => {
    const user = await seedUser({ isActive: true });

    const result = await toggleStatusHandler({ userId: user.id, isActive: false });

    expect(result).toEqual({ success: true });
    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated?.isActive).toBe(false);
  });

  it('should prevent toggling own status', async () => {
    await seedUser({ id: ADMIN_ID });

    await expect(toggleStatusHandler({ userId: ADMIN_ID, isActive: false })).rejects.toThrow('Không thể thay đổi trạng thái của chính mình.');
  });
});

describe('getUsersHandler', () => {
  it('should return all users with selected fields', async () => {
    await seedUser({ email: 'user1@test.com', role: 'admin' });
    await seedUser({ email: 'user2@test.com', role: 'member' });

    const result = await getUsersHandler();

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('email');
    expect(result[0]).toHaveProperty('role');
    expect(result[0]).not.toHaveProperty('emailVerified');
  });
});
