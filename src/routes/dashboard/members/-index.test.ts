import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetPersons = vi.fn();
const mockGetRelationships = vi.fn();

vi.mock("../../../members/server/member", () => ({
  getPersons: (...args: unknown[]) => mockGetPersons(...args),
}));

vi.mock("../../../relationships/server/relationship", () => ({
  getRelationships: (...args: unknown[]) => mockGetRelationships(...args),
}));

let capturedOptions: Record<string, unknown> = {};

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => {
    capturedOptions = opts;
    return { options: opts };
  },
}));

describe("dashboard/members/index loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch persons and relationships", async () => {
    const persons = [{ id: "1", fullName: "Test" }];
    const relationships = [{ id: "r1" }];
    mockGetPersons.mockResolvedValue(persons);
    mockGetRelationships.mockResolvedValue(relationships);

    await import("./index");

    const loader = capturedOptions.loader as () => Promise<unknown>;
    const result = await loader();

    expect(result).toEqual({ persons, relationships });
  });
});
