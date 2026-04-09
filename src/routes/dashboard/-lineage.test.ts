import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../events/components/LineageManager", () => ({ default: () => null }));

const mockGetPersons = vi.fn();
const mockGetRelationships = vi.fn();

vi.mock("../../members/server/member", () => ({
  getPersons: (...args: unknown[]) => mockGetPersons(...args),
}));

vi.mock("../../relationships/server/relationship", () => ({
  getRelationships: (...args: unknown[]) => mockGetRelationships(...args),
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

describe("dashboard/lineage beforeLoad", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await import("./lineage");
  });

  it("should allow admin through", () => {
    const beforeLoad = capturedOptions.beforeLoad as (ctx: BeforeLoadCtx) => void;

    expect(() => beforeLoad({ context: { session: { role: "admin" } } })).not.toThrow();
  });

  it("should redirect non-admin to /dashboard", () => {
    const beforeLoad = capturedOptions.beforeLoad as (ctx: BeforeLoadCtx) => void;

    try {
      beforeLoad({ context: { session: { role: "editor" } } });
      expect.unreachable("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(RedirectError);
      expect((err as RedirectError).to).toBe("/dashboard");
    }
  });
});

describe("dashboard/lineage loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch persons and relationships", async () => {
    const persons = [{ id: "1", fullName: "Test" }];
    const relationships = [{ id: "r1" }];
    mockGetPersons.mockResolvedValue(persons);
    mockGetRelationships.mockResolvedValue(relationships);

    const loader = capturedOptions.loader as () => Promise<unknown>;
    const result = await loader();

    expect(result).toEqual({ persons, relationships });
  });
});
