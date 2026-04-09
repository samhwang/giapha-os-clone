import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createPerson } from "../../../test/fixtures";
import { t } from "../../../test/i18n";
import { queryWrapper as wrapper } from "../../../test/render-wrapper";
import { useDashboardStore } from "../../dashboard/store/dashboardStore";
import { Gender } from "../../members/types";
import { RelationshipType } from "../types";
import RelationshipManager from "./RelationshipManager";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

const mockGetRelationshipsForPerson = vi.fn();
const mockGetPersons = vi.fn();
const mockCreateRelationship = vi.fn();
const mockDeleteRelationship = vi.fn();
const mockCreatePerson = vi.fn();

vi.mock("../server/relationship", () => ({
  getRelationshipsForPerson: (...args: unknown[]) => mockGetRelationshipsForPerson(...args),
  createRelationship: (...args: unknown[]) => mockCreateRelationship(...args),
  deleteRelationship: (...args: unknown[]) => mockDeleteRelationship(...args),
}));

const mockUpdatePerson = vi.fn();

vi.mock("../../members/server/member", () => ({
  getPersons: (...args: unknown[]) => mockGetPersons(...args),
  createPerson: (...args: unknown[]) => mockCreatePerson(...args),
  updatePerson: (...args: unknown[]) => mockUpdatePerson(...args),
}));

const personA = createPerson({ id: "p1", fullName: "Nguyễn Văn A", gender: Gender.enum.male });
const personB = createPerson({ id: "p2", fullName: "Trần Thị B", gender: Gender.enum.female });

describe("RelationshipManager", () => {
  let confirmSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    useDashboardStore.getState().reset();
    mockGetRelationshipsForPerson.mockReset().mockResolvedValue([]);
    mockGetPersons.mockReset().mockResolvedValue([]);
    mockCreateRelationship.mockReset().mockResolvedValue(undefined);
    mockDeleteRelationship.mockReset().mockResolvedValue(undefined);
    mockCreatePerson.mockReset().mockResolvedValue(createPerson({ id: "new-spouse-id" }));
    mockUpdatePerson.mockReset().mockResolvedValue(undefined);
    confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
  });

  afterEach(() => {
    confirmSpy.mockRestore();
  });

  it("renders relationship section titles", async () => {
    render(<RelationshipManager person={personA} canEdit={true} />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(
          new RegExp(t("relationship.parents").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          new RegExp(t("relationship.spouse").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        ),
      ).toBeInTheDocument();
      expect(screen.getByText(new RegExp(t("relationship.children"), "i"))).toBeInTheDocument();
    });
  });

  it("shows add buttons for editor", async () => {
    render(<RelationshipManager person={personA} canEdit={true} />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(
          new RegExp(t("relationship.addChild").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          new RegExp(t("relationship.addSpouse").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          new RegExp(t("relationship.addRelationship").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        ),
      ).toBeInTheDocument();
    });
  });

  it("hides add buttons for non-editor", async () => {
    render(<RelationshipManager person={personA} />, { wrapper });

    await waitFor(() => {
      expect(
        screen.queryByText(
          new RegExp(t("relationship.addChild").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        ),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          new RegExp(t("relationship.addSpouse").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        ),
      ).not.toBeInTheDocument();
    });
  });

  it("displays relationship target person name", async () => {
    mockGetRelationshipsForPerson.mockResolvedValue([
      {
        id: "r1",
        type: RelationshipType.enum.marriage,
        personAId: "p1",
        personBId: "p2",
        note: null,
      },
    ]);
    mockGetPersons.mockResolvedValue([personA, personB]);

    render(<RelationshipManager person={personA} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Trần Thị B")).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    mockGetRelationshipsForPerson.mockReturnValue(new Promise(() => {}));
    mockGetPersons.mockReturnValue(new Promise(() => {}));

    render(<RelationshipManager person={personA} />, { wrapper });
    expect(screen.getByText(new RegExp(t("common.loading"), "i"))).toBeInTheDocument();
  });

  it("shows empty state for sections with no relationships when canEdit", async () => {
    render(<RelationshipManager person={personA} canEdit={true} />, { wrapper });

    await waitFor(() => {
      const emptyTexts = screen.getAllByText(
        new RegExp(t("relationship.noInfo").replace(".", "\\."), "i"),
      );
      expect(emptyTexts.length).toBeGreaterThan(0);
    });
  });

  it("clicking add relationship opens form", async () => {
    const user = userEvent.setup();
    render(<RelationshipManager person={personA} canEdit={true} />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(
          new RegExp(t("relationship.addRelationship").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        ),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByText(
        new RegExp(t("relationship.addRelationship").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      ),
    );

    expect(
      screen.getByText(new RegExp(t("relationship.addNewRelationship"), "i")),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(new RegExp(t("relationship.searchPlaceholder"), "i")),
    ).toBeInTheDocument();
  });

  it("delete relationship calls deleteRelationship", async () => {
    confirmSpy.mockReturnValue(true);
    mockGetRelationshipsForPerson.mockResolvedValue([
      {
        id: "r1",
        type: RelationshipType.enum.marriage,
        personAId: "p1",
        personBId: "p2",
        note: null,
      },
    ]);
    mockGetPersons.mockResolvedValue([personA, personB]);

    const user = userEvent.setup();
    render(<RelationshipManager person={personA} canEdit={true} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Trần Thị B")).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: new RegExp(t("relationship.deleteRelationship"), "i") }),
    );

    await waitFor(() => {
      expect(mockDeleteRelationship).toHaveBeenCalledWith({ data: { id: "r1" } });
    });
  });

  it("delete cancel does not call server", async () => {
    mockGetRelationshipsForPerson.mockResolvedValue([
      {
        id: "r1",
        type: RelationshipType.enum.marriage,
        personAId: "p1",
        personBId: "p2",
        note: null,
      },
    ]);
    mockGetPersons.mockResolvedValue([personA, personB]);

    const user = userEvent.setup();
    render(<RelationshipManager person={personA} canEdit={true} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Trần Thị B")).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: new RegExp(t("relationship.deleteRelationship"), "i") }),
    );
    expect(mockDeleteRelationship).not.toHaveBeenCalled();
  });

  it("quick add spouse creates person and relationship", async () => {
    const user = userEvent.setup();
    render(<RelationshipManager person={personA} canEdit={true} />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(
          new RegExp(t("relationship.addSpouse").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        ),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByText(
        new RegExp(t("relationship.addSpouse").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      ),
    );

    expect(
      screen.getByText(
        new RegExp(t("relationship.quickAddSpouse").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      ),
    ).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(new RegExp(t("relationship.fullNameRequired"), "i")),
      "Trần Thị C",
    );
    await user.click(screen.getByText(/^lưu$/i));

    await waitFor(() => {
      expect(mockCreatePerson).toHaveBeenCalledWith({
        data: expect.objectContaining({ fullName: "Trần Thị C", gender: Gender.enum.female }),
      });
    });

    await waitFor(() => {
      expect(mockCreateRelationship).toHaveBeenCalledWith({
        data: expect.objectContaining({ personAId: "p1", type: RelationshipType.enum.marriage }),
      });
    });
  });

  it('clicking "Thêm con" shows BulkAddChildrenForm', async () => {
    const user = userEvent.setup();
    render(<RelationshipManager person={personA} canEdit={true} />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(
          new RegExp(t("relationship.addChild").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        ),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByText(
        new RegExp(t("relationship.addChild").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      ),
    );

    expect(
      screen.getByText(
        new RegExp(t("relationship.bulkAddChildren").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        new RegExp(t("relationship.addRow").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      ),
    ).toBeInTheDocument();
  });

  it("error banner can be dismissed", async () => {
    mockCreatePerson.mockRejectedValue(new Error("Test error"));

    const user = userEvent.setup();
    render(<RelationshipManager person={personA} canEdit={true} />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(
          new RegExp(t("relationship.addSpouse").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        ),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByText(
        new RegExp(t("relationship.addSpouse").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      ),
    );
    await user.type(
      screen.getByLabelText(new RegExp(t("relationship.fullNameRequired"), "i")),
      "Trần Thị C",
    );
    await user.click(screen.getByText(/^lưu$/i));

    await waitFor(() => {
      expect(screen.getByText(/Test error/i)).toBeInTheDocument();
    });

    // Dismiss the error banner
    await user.click(screen.getByRole("button", { name: "×" }));

    await waitFor(() => {
      expect(screen.queryByText(/Test error/i)).not.toBeInTheDocument();
    });
  });

  it("shows inline error on add spouse failure", async () => {
    mockCreatePerson.mockRejectedValue(new Error("Network error"));

    const user = userEvent.setup();
    render(<RelationshipManager person={personA} canEdit={true} />, { wrapper });

    await waitFor(() => {
      expect(
        screen.getByText(
          new RegExp(t("relationship.addSpouse").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        ),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByText(
        new RegExp(t("relationship.addSpouse").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
      ),
    );
    await user.type(
      screen.getByLabelText(new RegExp(t("relationship.fullNameRequired"), "i")),
      "Trần Thị C",
    );
    await user.click(screen.getByText(/^lưu$/i));

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
});
