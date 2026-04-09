import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { t } from "../../../test/i18n";
import QuickAddSpouseForm from "./QuickAddSpouseForm";

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("QuickAddSpouseForm", () => {
  const defaultProps = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
    processing: false,
    personGender: "male",
  };

  it("renders name, birth year, and note fields", () => {
    render(<QuickAddSpouseForm {...defaultProps} />);

    expect(
      screen.getByLabelText(new RegExp(escRe(t("relationship.fullNameRequired")), "i")),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(new RegExp(escRe(t("relationship.birthYearOptional")), "i")),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(new RegExp(escRe(t("relationship.spouseNoteLabel")), "i")),
    ).toBeInTheDocument();
  });

  it("submit calls onSubmit with field values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<QuickAddSpouseForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(
      screen.getByLabelText(new RegExp(escRe(t("relationship.fullNameRequired")), "i")),
      "Trần Thị B",
    );
    await user.type(
      screen.getByLabelText(new RegExp(escRe(t("relationship.birthYearOptional")), "i")),
      "1990",
    );
    await user.type(
      screen.getByLabelText(new RegExp(escRe(t("relationship.spouseNoteLabel")), "i")),
      "Vợ cả",
    );

    await user.click(
      screen.getByRole("button", { name: new RegExp(`^${t("common.save")}$`, "i") }),
    );

    expect(onSubmit).toHaveBeenCalledWith({ name: "Trần Thị B", birthYear: "1990", note: "Vợ cả" });
  });

  it("shows disabled button when processing", () => {
    render(<QuickAddSpouseForm {...defaultProps} processing={true} />);

    const saveButton = screen.getByRole("button", { name: new RegExp(t("common.saving"), "i") });
    expect(saveButton).toBeDisabled();
  });

  it("cancel calls onCancel", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<QuickAddSpouseForm {...defaultProps} onCancel={onCancel} />);

    await user.click(
      screen.getByRole("button", { name: new RegExp(`^${t("common.cancel")}$`, "i") }),
    );

    expect(onCancel).toHaveBeenCalled();
  });
});
