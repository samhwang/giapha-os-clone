import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Modal, ModalCloseButton, ModalPanel } from "./Modal";

describe("Modal", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <Modal isOpen={false}>
        <div>Content</div>
      </Modal>,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders children when isOpen is true", () => {
    render(
      <Modal isOpen>
        <div>Content</div>
      </Modal>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("locks body scroll when open and restores on unmount", () => {
    document.body.style.overflow = "auto";
    const { unmount } = render(
      <Modal isOpen>
        <div>Content</div>
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("renders backdrop when onClose is provided", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen onClose={onClose}>
        <div>Content</div>
      </Modal>,
    );
    const backdrop = container.querySelector('[aria-hidden="true"]');
    expect(backdrop).toBeInTheDocument();
  });

  it("does not render backdrop when onClose is not provided", () => {
    const { container } = render(
      <Modal isOpen>
        <div>Content</div>
      </Modal>,
    );
    const backdrop = container.querySelector('[aria-hidden="true"]');
    expect(backdrop).not.toBeInTheDocument();
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        <div>Content</div>
      </Modal>,
    );
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not register escape handler when onClose is not provided", () => {
    const { unmount } = render(
      <Modal isOpen>
        <div>Content</div>
      </Modal>,
    );
    // Should not throw — just verifying no error when Escape is pressed without onClose
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    unmount();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen onClose={onClose}>
        <div>Content</div>
      </Modal>,
    );
    const backdrop = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("ModalPanel", () => {
  it("renders children", () => {
    render(<ModalPanel>Panel content</ModalPanel>);
    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });

  it("applies 4xl max-width by default", () => {
    const { container } = render(<ModalPanel>Content</ModalPanel>);
    expect(container.firstChild).toHaveClass("max-w-4xl");
  });

  it("applies custom max-width", () => {
    const { container } = render(<ModalPanel maxWidth="2xl">Content</ModalPanel>);
    expect(container.firstChild).toHaveClass("max-w-2xl");
  });

  it("applies custom className", () => {
    const { container } = render(<ModalPanel className="p-8">Content</ModalPanel>);
    expect(container.firstChild).toHaveClass("p-8");
  });
});

describe("ModalCloseButton", () => {
  it("renders with required label", () => {
    render(<ModalCloseButton onClick={vi.fn()} label="Close" />);
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<ModalCloseButton onClick={vi.fn()} label="Dismiss" />);
    expect(screen.getByLabelText("Dismiss")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ModalCloseButton onClick={onClick} label="Close" />);
    await user.click(screen.getByLabelText("Close"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
