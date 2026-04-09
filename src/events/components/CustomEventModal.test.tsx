import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CustomEventRecord } from "../types";

import { t } from "../../../test/i18n";
import { renderWithProviders } from "../../../test/render-wrapper";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

vi.mock("../server/customEvent", () => ({
  createCustomEvent: vi.fn().mockResolvedValue({}),
  updateCustomEvent: vi.fn().mockResolvedValue({}),
  deleteCustomEvent: vi.fn().mockResolvedValue({ success: true }),
}));

import { createCustomEvent, updateCustomEvent } from "../server/customEvent";
import CustomEventModal from "./CustomEventModal";

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

const mockEvent: CustomEventRecord = {
  id: "evt-1",
  name: "Giỗ Ông",
  eventDate: "2025-03-15",
  location: "Hà Nội",
  content: "Nội dung sự kiện",
  createdBy: null,
};

describe("CustomEventModal", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = renderWithProviders(
      <CustomEventModal {...defaultProps} isOpen={false} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders create mode title when no eventToEdit", () => {
    renderWithProviders(<CustomEventModal {...defaultProps} />);
    expect(screen.getByText(t("customEvent.createTitle"))).toBeInTheDocument();
  });

  it("renders edit mode title when eventToEdit is provided", () => {
    renderWithProviders(<CustomEventModal {...defaultProps} eventToEdit={mockEvent} />);
    expect(screen.getByText(t("customEvent.editTitle"))).toBeInTheDocument();
  });

  it("pre-fills form fields in edit mode", () => {
    renderWithProviders(<CustomEventModal {...defaultProps} eventToEdit={mockEvent} />);
    expect(screen.getByDisplayValue("Giỗ Ông")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2025-03-15")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Hà Nội")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Nội dung sự kiện")).toBeInTheDocument();
  });

  it("shows delete button only in edit mode", () => {
    const { rerender } = renderWithProviders(<CustomEventModal {...defaultProps} />);
    expect(screen.queryByText(t("customEvent.delete"))).not.toBeInTheDocument();

    rerender(<CustomEventModal {...defaultProps} eventToEdit={mockEvent} />);
    expect(screen.getByText(t("customEvent.delete"))).toBeInTheDocument();
  });

  it("calls createCustomEvent on submit in create mode", async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <CustomEventModal isOpen onClose={onClose} onSuccess={onSuccess} />,
    );

    await user.type(screen.getByLabelText(new RegExp(t("customEvent.name"))), "New Event");
    await user.type(
      screen.getByLabelText(new RegExp(escapeRegex(t("customEvent.date")))),
      "2025-06-01",
    );
    await user.click(screen.getByText(t("customEvent.save")));

    await waitFor(() => {
      expect(createCustomEvent).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("calls updateCustomEvent on submit in edit mode", async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <CustomEventModal isOpen onClose={onClose} onSuccess={onSuccess} eventToEdit={mockEvent} />,
    );

    await user.clear(screen.getByDisplayValue("Giỗ Ông"));
    await user.type(screen.getByLabelText(new RegExp(t("customEvent.name"))), "Updated Name");
    await user.click(screen.getByText(t("customEvent.save")));

    await waitFor(() => {
      expect(updateCustomEvent).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("calls onClose when cancel button is clicked", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(
      <CustomEventModal isOpen onClose={onClose} onSuccess={vi.fn()} />,
    );

    await user.click(screen.getByText(t("common.cancel"), { selector: "button" }));
    expect(onClose).toHaveBeenCalled();
  });
});
