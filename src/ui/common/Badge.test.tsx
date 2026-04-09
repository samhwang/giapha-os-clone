import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Label</Badge>);
    expect(screen.getByText("Label")).toBeInTheDocument();
  });

  it("applies stone color by default", () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild).toHaveClass("bg-stone-100");
    expect(container.firstChild).toHaveClass("text-stone-500");
  });

  it("applies amber color variant", () => {
    const { container } = render(<Badge color="amber">Amber</Badge>);
    expect(container.firstChild).toHaveClass("bg-amber-50");
    expect(container.firstChild).toHaveClass("text-amber-700");
  });

  it("applies emerald color variant", () => {
    const { container } = render(<Badge color="emerald">Emerald</Badge>);
    expect(container.firstChild).toHaveClass("bg-emerald-50");
    expect(container.firstChild).toHaveClass("text-emerald-700");
  });

  it("applies sky color variant", () => {
    const { container } = render(<Badge color="sky">Sky</Badge>);
    expect(container.firstChild).toHaveClass("bg-sky-50");
    expect(container.firstChild).toHaveClass("text-sky-700");
  });

  it("applies rose color variant", () => {
    const { container } = render(<Badge color="rose">Rose</Badge>);
    expect(container.firstChild).toHaveClass("bg-rose-50");
    expect(container.firstChild).toHaveClass("text-rose-700");
  });

  it("applies sm size variant", () => {
    const { container } = render(<Badge size="sm">Small</Badge>);
    expect(container.firstChild).toHaveClass("px-1.5");
    expect(container.firstChild).toHaveClass("text-3xs");
  });

  it("applies md size variant by default", () => {
    const { container } = render(<Badge>Medium</Badge>);
    expect(container.firstChild).toHaveClass("px-2");
    expect(container.firstChild).toHaveClass("rounded-badge");
  });

  it("applies custom className", () => {
    const { container } = render(<Badge className="ml-2">Custom</Badge>);
    expect(container.firstChild).toHaveClass("ml-2");
  });
});
