import { describe, expect, it } from "vitest";

import { ancestorDepthTerm, descendantDepthTerm } from "./kinship-dictionary";

describe("ancestorDepthTerm", () => {
  it("returns empty string for depth 0", () => {
    expect(ancestorDepthTerm(0)).toBe("Tổ đời 0");
  });

  it('returns "Tổ đời 1" for depth 1', () => {
    expect(ancestorDepthTerm(1)).toBe("Tổ đời 1");
  });

  it('returns "Tổ đời 10" for depth 10', () => {
    expect(ancestorDepthTerm(10)).toBe("Tổ đời 10");
  });

  it("handles large depths", () => {
    expect(ancestorDepthTerm(99)).toBe("Tổ đời 99");
  });
});

describe("descendantDepthTerm", () => {
  it('returns "Cháu đời 0" for depth 0', () => {
    expect(descendantDepthTerm(0)).toBe("Cháu đời 0");
  });

  it('returns "Cháu đời 1" for depth 1', () => {
    expect(descendantDepthTerm(1)).toBe("Cháu đời 1");
  });

  it('returns "Cháu đời 7" for depth 7', () => {
    expect(descendantDepthTerm(7)).toBe("Cháu đời 7");
  });

  it("handles large depths", () => {
    expect(descendantDepthTerm(99)).toBe("Cháu đời 99");
  });
});
