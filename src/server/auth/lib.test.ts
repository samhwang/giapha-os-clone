import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../types';
import { ensureAdmin, ensureAuthenticated, ensureEditor, getSessionFromRequest } from './lib';

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
    role: UserRole.enum.admin,
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: { id: 'session-1', userId: 'user-1', token: 'abc' },
};

const activeEditor = {
  user: {
    id: 'user-2',
    email: 'editor@test.com',
    name: 'Editor',
    role: UserRole.enum.editor,
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: { id: 'session-2', userId: 'user-2', token: 'def' },
};

const activeMember = {
  user: {
    id: 'user-3',
    email: 'member@test.com',
    name: 'Member',
    role: UserRole.enum.member,
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: { id: 'session-3', userId: 'user-3', token: 'ghi' },
};

const inactiveUser = {
  user: {
    id: 'user-4',
    email: 'inactive@test.com',
    name: 'Inactive',
    role: UserRole.enum.member,
    isActive: false,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  session: { id: 'session-4', userId: 'user-4', token: 'jkl' },
};

describe('getSessionFromRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return session when session exists', async () => {
    mockGetSession.mockResolvedValue(activeAdmin);
    const result = await getSessionFromRequest();
    expect(result).toEqual(activeAdmin);
  });

  it('should return null when no session exists', async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await getSessionFromRequest();
    expect(result).toBeNull();
  });
});

describe('ensureAuthenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user when session is active', async () => {
    mockGetSession.mockResolvedValue(activeAdmin);
    const user = await ensureAuthenticated();
    expect(user.id).toBe('user-1');
    expect(user.role).toBe('admin');
  });

  it('should throw when no session exists', async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(ensureAuthenticated()).rejects.toThrow('error.auth.loginRequired');
  });

  it('should throw when user is inactive', async () => {
    mockGetSession.mockResolvedValue(inactiveUser);
    await expect(ensureAuthenticated()).rejects.toThrow('error.auth.inactive');
  });

  it('should return member user when session is active', async () => {
    mockGetSession.mockResolvedValue(activeMember);
    const user = await ensureAuthenticated();
    expect(user.id).toBe('user-3');
    expect(user.role).toBe('member');
  });
});

describe('ensureEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user when session is admin', async () => {
    mockGetSession.mockResolvedValue(activeAdmin);
    const user = await ensureEditor();
    expect(user.id).toBe('user-1');
    expect(user.role).toBe('admin');
  });

  it('should return user when session is editor', async () => {
    mockGetSession.mockResolvedValue(activeEditor);
    const user = await ensureEditor();
    expect(user.id).toBe('user-2');
    expect(user.role).toBe('editor');
  });

  it('should throw when no session exists', async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(ensureEditor()).rejects.toThrow('error.auth.loginRequired');
  });

  it('should throw when user is inactive', async () => {
    mockGetSession.mockResolvedValue(inactiveUser);
    await expect(ensureEditor()).rejects.toThrow('error.auth.inactive');
  });

  it('should throw when user is member', async () => {
    mockGetSession.mockResolvedValue(activeMember);
    await expect(ensureEditor()).rejects.toThrow('error.auth.editorOnly');
  });
});

describe('ensureAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user when session is admin', async () => {
    mockGetSession.mockResolvedValue(activeAdmin);
    const user = await ensureAdmin();
    expect(user.id).toBe('user-1');
    expect(user.role).toBe('admin');
  });

  it('should throw when no session exists', async () => {
    mockGetSession.mockResolvedValue(null);
    await expect(ensureAdmin()).rejects.toThrow('error.auth.loginRequired');
  });

  it('should throw when user is editor', async () => {
    mockGetSession.mockResolvedValue(activeEditor);
    await expect(ensureAdmin()).rejects.toThrow('error.auth.adminOnly');
  });

  it('should throw when user is member', async () => {
    mockGetSession.mockResolvedValue(activeMember);
    await expect(ensureAdmin()).rejects.toThrow('error.auth.adminOnly');
  });
});
