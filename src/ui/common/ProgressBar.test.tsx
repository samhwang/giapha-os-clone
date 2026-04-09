import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("renders with correct width percentage", () => {
    const { container } = render(<ProgressBar value={50} max={100} />);
    const bar = container.querySelector(".rounded-full.transition-all");
    expect(bar).toHaveStyle({ width: "50%" });
  });

  it("renders 0% when max is 0", () => {
    const { container } = render(<ProgressBar value={10} max={0} />);
    const bar = container.querySelector(".rounded-full.transition-all");
    expect(bar).toHaveStyle({ width: "0%" });
  });

  it("applies default medium size", () => {
    const { container } = render(<ProgressBar value={50} max={100} />);
    expect(container.firstChild).toHaveClass("h-2");
  });

  it("applies small size", () => {
    const { container } = render(<ProgressBar value={50} max={100} size="sm" />);
    expect(container.firstChild).toHaveClass("h-1.5");
  });

  it("applies custom color", () => {
    const { container } = render(<ProgressBar value={50} max={100} color="bg-purple-400" />);
    const bar = container.querySelector(".rounded-full.transition-all");
    expect(bar).toHaveClass("bg-purple-400");
  });

  it("applies default amber color", () => {
    const { container } = render(<ProgressBar value={50} max={100} />);
    const bar = container.querySelector(".rounded-full.transition-all");
    expect(bar).toHaveClass("bg-amber-400");
  });

  it("applies transition delay when provided", () => {
    const { container } = render(<ProgressBar value={50} max={100} delay={0.5} />);
    const bar = container.querySelector(".rounded-full.transition-all");
    expect(bar).toHaveStyle({ transitionDelay: "0.5s" });
  });

  it("clamps value exceeding max to 100%", () => {
    const { container } = render(<ProgressBar value={150} max={100} />);
    const bar = container.querySelector(".rounded-full.transition-all");
    expect(bar).toHaveStyle({ width: "100%" });
  });

  it("clamps negative value to 0%", () => {
    const { container } = render(<ProgressBar value={-10} max={100} />);
    const bar = container.querySelector(".rounded-full.transition-all");
    expect(bar).toHaveStyle({ width: "0%" });
  });

  it("renders 0% for NaN value", () => {
    const { container } = render(<ProgressBar value={Number.NaN} max={100} />);
    const bar = container.querySelector(".rounded-full.transition-all");
    expect(bar).toHaveStyle({ width: "0%" });
  });

  it("applies custom className", () => {
    const { container } = render(<ProgressBar value={50} max={100} className="mt-4" />);
    expect(container.firstChild).toHaveClass("mt-4");
  });
});
