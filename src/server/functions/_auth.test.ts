import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-start/server', () => ({
  getRequestHeaders: vi.fn(() => new Headers()),
}));

const mockGetSession = vi.fn();
vi.mock('../../lib/auth', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

const activeAdmin = {
  user: {
    id: 'user-1',
    email: 'admin@test.com',
    name: 'Admin',
    role: 'admin',
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: { id: 'session-1', userId: 'user-1', token: 'abc' },
};

const activeMember = {
  user: {
    id: 'user-2',
    email: 'member@test.com',
    name: 'Member',
    role: 'member',
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: { id: 'session-2', userId: 'user-2', token: 'def' },
};

const inactiveUser = {
  user: {
    id: 'user-3',
    email: 'inactive@test.com',
    name: 'Inactive',
    role: 'member',
    isActive: false,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: { id: 'session-3', userId: 'user-3', token: 'ghi' },
};

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user when session is active', async () => {
    mockGetSession.mockResolvedValue(activeAdmin);

    const { requireAuth } = await import('./_auth');
    const user = await requireAuth();

    expect(user.id).toBe('user-1');
    expect(user.role).toBe('admin');
  });

  it('should throw when no session exists', async () => {
    mockGetSession.mockResolvedValue(null);

    const { requireAuth } = await import('./_auth');
    await expect(requireAuth()).rejects.toThrow('error.auth.loginRequired');
  });

  it('should throw when user is inactive', async () => {
    mockGetSession.mockResolvedValue(inactiveUser);

    const { requireAuth } = await import('./_auth');
    await expect(requireAuth()).rejects.toThrow('error.auth.inactive');
  });

  it('should return member user when session is active', async () => {
    mockGetSession.mockResolvedValue(activeMember);

    const { requireAuth } = await import('./_auth');
    const user = await requireAuth();

    expect(user.id).toBe('user-2');
    expect(user.role).toBe('member');
  });
});

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user when session is admin', async () => {
    mockGetSession.mockResolvedValue(activeAdmin);

    const { requireAdmin } = await import('./_auth');
    const user = await requireAdmin();

    expect(user.id).toBe('user-1');
    expect(user.role).toBe('admin');
  });

  it('should throw when no session exists', async () => {
    mockGetSession.mockResolvedValue(null);

    const { requireAdmin } = await import('./_auth');
    await expect(requireAdmin()).rejects.toThrow('error.auth.loginRequired');
  });

  it('should throw when user is not admin', async () => {
    mockGetSession.mockResolvedValue(activeMember);

    const { requireAdmin } = await import('./_auth');
    await expect(requireAdmin()).rejects.toThrow('error.auth.adminOnly');
  });
});
