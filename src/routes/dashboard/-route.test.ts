import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSession = vi.fn();

vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => ({
    handler: (fn: unknown) => {
      mockGetSession.mockImplementation(fn as (...args: unknown[]) => unknown);
      return mockGetSession;
    },
  }),
}));

vi.mock('@tanstack/react-start/server', () => ({
  getRequestHeaders: vi.fn(() => new Headers()),
}));

const mockAuthGetSession = vi.fn();

vi.mock('../../auth/server', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockAuthGetSession(...args),
    },
  },
}));

class RedirectError {
  to: string;
  constructor(opts: { to: string }) {
    this.to = opts.to;
  }
}

let capturedOptions: Record<string, unknown> = {};

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => {
    capturedOptions = opts;
    return { options: opts };
  },
  redirect: (opts: { to: string }) => {
    throw new RedirectError(opts);
  },
  Link: () => null,
  Outlet: () => null,
}));

describe('dashboard/route beforeLoad', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should return session context when authenticated', async () => {
    mockAuthGetSession.mockResolvedValue({
      user: { id: 'u1', email: 'admin@test.com', role: 'admin', isActive: true },
    });

    await import('./route');

    const beforeLoad = capturedOptions.beforeLoad as () => Promise<unknown>;
    const result = await beforeLoad();

    expect(result).toEqual({
      session: {
        id: 'u1',
        email: 'admin@test.com',
        role: 'admin',
        isActive: true,
      },
    });
  });

  it('should redirect to /login when no session', async () => {
    mockAuthGetSession.mockResolvedValue(null);

    await import('./route');

    const beforeLoad = capturedOptions.beforeLoad as () => Promise<unknown>;

    try {
      await beforeLoad();
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RedirectError);
      expect((err as RedirectError).to).toBe('/login');
    }
  });
});
