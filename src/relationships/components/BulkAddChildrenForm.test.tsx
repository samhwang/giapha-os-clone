import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { t } from "../../../test/i18n";
import BulkAddChildrenForm from "./BulkAddChildrenForm";

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("BulkAddChildrenForm", () => {
  const defaultProps = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
    processing: false,
    spouses: [{ id: "s1", fullName: "Spouse A", note: null }],
  };

  it("renders with one default child row", () => {
    render(<BulkAddChildrenForm {...defaultProps} />);

    const nameInputs = screen.getAllByPlaceholderText(
      new RegExp(t("relationship.fullNamePlaceholder"), "i"),
    );
    expect(nameInputs).toHaveLength(1);
  });

  it("add row button adds another child row", async () => {
    const user = userEvent.setup();
    render(<BulkAddChildrenForm {...defaultProps} />);

    await user.click(screen.getByText(new RegExp(escRe(t("relationship.addRow")), "i")));

    const nameInputs = screen.getAllByPlaceholderText(
      new RegExp(t("relationship.fullNamePlaceholder"), "i"),
    );
    expect(nameInputs).toHaveLength(2);
  });

  it("remove row button removes a child row but keeps at least 1", async () => {
    const user = userEvent.setup();
    render(<BulkAddChildrenForm {...defaultProps} />);

    // Add a second row first
    await user.click(screen.getByText(new RegExp(escRe(t("relationship.addRow")), "i")));
    expect(
      screen.getAllByPlaceholderText(new RegExp(t("relationship.fullNamePlaceholder"), "i")),
    ).toHaveLength(2);

    // Remove one row
    const removeButtons = screen.getAllByRole("button", { name: /✕/ });
    await user.click(removeButtons[0]);
    expect(
      screen.getAllByPlaceholderText(new RegExp(t("relationship.fullNamePlaceholder"), "i")),
    ).toHaveLength(1);

    // Removing the last row should still keep one row
    const lastRemoveButton = screen.getByRole("button", { name: /✕/ });
    await user.click(lastRemoveButton);
    expect(
      screen.getAllByPlaceholderText(new RegExp(t("relationship.fullNamePlaceholder"), "i")),
    ).toHaveLength(1);
  });

  it("fill child name and submit calls onSubmit with children data", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<BulkAddChildrenForm {...defaultProps} onSubmit={onSubmit} />);

    const nameInput = screen.getByPlaceholderText(
      new RegExp(t("relationship.fullNamePlaceholder"), "i"),
    );
    await user.type(nameInput, "Nguyễn Văn C");

    await user.click(
      screen.getByRole("button", { name: new RegExp(t("relationship.saveAll"), "i") }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      spouseId: "",
      children: [{ name: "Nguyễn Văn C", gender: "male", birthYear: "", birthOrder: "1" }],
    });
  });

  it("spouse selector shows available spouses", () => {
    render(<BulkAddChildrenForm {...defaultProps} />);

    const select = screen.getByLabelText(new RegExp(t("relationship.selectOtherParent"), "i"));
    expect(select).toBeInTheDocument();

    // Check spouse option exists
    const options = select.querySelectorAll("option");
    const spouseOption = Array.from(options).find((o) => o.textContent?.includes("Spouse A"));
    expect(spouseOption).toBeTruthy();
  });

  it("cancel calls onCancel", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<BulkAddChildrenForm {...defaultProps} onCancel={onCancel} />);

    await user.click(
      screen.getByRole("button", { name: new RegExp(`^${t("common.cancel")}$`, "i") }),
    );

    expect(onCancel).toHaveBeenCalled();
  });
});
