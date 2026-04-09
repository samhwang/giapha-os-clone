import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { t } from "../../../test/i18n";
import { queryWrapper as wrapper } from "../../../test/render-wrapper";
import DeleteMemberButton from "./DeleteMemberButton";

const mockNavigate = vi.fn();
const mockDeleteMember = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../server/member", () => ({
  deleteMember: (...args: unknown[]) => mockDeleteMember(...args),
}));

describe("DeleteMemberButton", () => {
  let confirmSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockDeleteMember.mockReset().mockResolvedValue(undefined);
    mockNavigate.mockReset();
    confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
  });

  afterEach(() => {
    confirmSpy.mockRestore();
  });

  it("renders delete button", () => {
    render(<DeleteMemberButton memberId="test-id" />, { wrapper });
    expect(
      screen.getByRole("button", { name: new RegExp(t("member.deleteButton"), "i") }),
    ).toBeInTheDocument();
  });

  it("shows confirm dialog on click", async () => {
    const user = userEvent.setup();
    render(<DeleteMemberButton memberId="test-id" />, { wrapper });

    await user.click(
      screen.getByRole("button", { name: new RegExp(t("member.deleteButton"), "i") }),
    );
    expect(confirmSpy).toHaveBeenCalled();
  });

  it("does not delete when confirm is cancelled", async () => {
    const user = userEvent.setup();
    render(<DeleteMemberButton memberId="test-id" />, { wrapper });

    await user.click(
      screen.getByRole("button", { name: new RegExp(t("member.deleteButton"), "i") }),
    );
    expect(mockDeleteMember).not.toHaveBeenCalled();
  });

  it("confirms and deletes, then navigates", async () => {
    confirmSpy.mockReturnValue(true);
    const user = userEvent.setup();
    render(<DeleteMemberButton memberId="test-id" />, { wrapper });

    await user.click(
      screen.getByRole("button", { name: new RegExp(t("member.deleteButton"), "i") }),
    );

    await waitFor(() => {
      expect(mockDeleteMember).toHaveBeenCalledWith({ data: { id: "test-id" } });
    });
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard/members" });
  });

  it("shows loading text during deletion", async () => {
    confirmSpy.mockReturnValue(true);
    mockDeleteMember.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<DeleteMemberButton memberId="test-id" />, { wrapper });

    await user.click(
      screen.getByRole("button", { name: new RegExp(t("member.deleteButton"), "i") }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: new RegExp(t("common.deleting"), "i") }),
      ).toBeDisabled();
    });
  });

  it("shows inline error on failure", async () => {
    confirmSpy.mockReturnValue(true);
    mockDeleteMember.mockRejectedValue(new Error("Delete failed"));
    const user = userEvent.setup();
    render(<DeleteMemberButton memberId="test-id" />, { wrapper });

    await user.click(
      screen.getByRole("button", { name: new RegExp(t("member.deleteButton"), "i") }),
    );

    await waitFor(() => {
      expect(screen.getByText("Delete failed")).toBeInTheDocument();
    });
  });
});
