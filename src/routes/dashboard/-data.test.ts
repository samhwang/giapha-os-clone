import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../admin/components/DataImportExport', () => ({ default: () => null }));

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
}));

type BeforeLoadCtx = { context: { session: { role: string } | null } };

describe('dashboard/data beforeLoad', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await import('./data');
  });

  it('should allow admin through', () => {
    const beforeLoad = capturedOptions.beforeLoad as (ctx: BeforeLoadCtx) => void;

    expect(() => beforeLoad({ context: { session: { role: 'admin' } } })).not.toThrow();
  });

  it('should redirect non-admin to /dashboard', () => {
    const beforeLoad = capturedOptions.beforeLoad as (ctx: BeforeLoadCtx) => void;

    try {
      beforeLoad({ context: { session: { role: 'member' } } });
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RedirectError);
      expect((err as RedirectError).to).toBe('/dashboard');
    }
  });

  it('should redirect when no session', () => {
    const beforeLoad = capturedOptions.beforeLoad as (ctx: BeforeLoadCtx) => void;

    try {
      beforeLoad({ context: { session: null } });
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RedirectError);
      expect((err as RedirectError).to).toBe('/dashboard');
    }
  });
});
