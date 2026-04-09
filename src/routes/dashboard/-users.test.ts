import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUsers = vi.fn();

vi.mock("../../admin/server/user", () => ({
  getUsers: (...args: unknown[]) => mockGetUsers(...args),
}));

class RedirectError {
  to: string;
  constructor(opts: { to: string }) {
    this.to = opts.to;
  }
}

let capturedOptions: Record<string, unknown> = {};

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => {
    capturedOptions = opts;
    return { options: opts };
  },
  redirect: (opts: { to: string }) => {
    throw new RedirectError(opts);
  },
}));

type BeforeLoadCtx = { context: { session: { role: string } | null } };

describe("dashboard/users beforeLoad", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await import("./users");
  });

  it("should allow admin through", () => {
    const beforeLoad = capturedOptions.beforeLoad as (ctx: BeforeLoadCtx) => void;

    expect(() => beforeLoad({ context: { session: { role: "admin" } } })).not.toThrow();
  });

  it("should redirect non-admin to /dashboard", () => {
    const beforeLoad = capturedOptions.beforeLoad as (ctx: BeforeLoadCtx) => void;

    try {
      beforeLoad({ context: { session: { role: "member" } } });
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(RedirectError);
      expect((err as RedirectError).to).toBe("/dashboard");
    }
  });

  it("should redirect when no session", () => {
    const beforeLoad = capturedOptions.beforeLoad as (ctx: BeforeLoadCtx) => void;

    try {
      beforeLoad({ context: { session: null } });
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(RedirectError);
      expect((err as RedirectError).to).toBe("/dashboard");
    }
  });
});

describe("dashboard/users loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch users", async () => {
    const users = [{ id: "u1", email: "test@example.com" }];
    mockGetUsers.mockResolvedValue(users);

    const loader = capturedOptions.loader as () => Promise<unknown>;
    const result = await loader();

    expect(result).toEqual({ users });
  });
});
