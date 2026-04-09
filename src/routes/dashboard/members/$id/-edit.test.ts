import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetPersonById = vi.fn();

vi.mock("../../../../members/server/member", () => ({
  getPersonById: (...args: unknown[]) => mockGetPersonById(...args),
}));

let capturedOptions: Record<string, unknown> = {};

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (opts: Record<string, unknown>) => {
    capturedOptions = opts;
    return { options: opts };
  },
  Link: () => null,
}));

describe("dashboard/members/$id/edit loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch person by id with private details", async () => {
    const person = { id: "p1", fullName: "Test", privateDetails: { phoneNumber: "123" } };
    mockGetPersonById.mockResolvedValue(person);

    await import("./edit");

    const loader = capturedOptions.loader as (ctx: { params: { id: string } }) => Promise<unknown>;
    const result = await loader({ params: { id: "p1" } });

    expect(mockGetPersonById).toHaveBeenCalledWith({ data: { id: "p1" } });
    expect(result).toEqual({ person, privateData: person.privateDetails });
  });

  it("should throw when person is not found", async () => {
    mockGetPersonById.mockResolvedValue(null);

    const loader = capturedOptions.loader as (ctx: { params: { id: string } }) => Promise<unknown>;

    await expect(loader({ params: { id: "missing" } })).rejects.toThrow("Member not found");
  });
});
