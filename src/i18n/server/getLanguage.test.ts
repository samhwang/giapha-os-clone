import { describe, expect, it } from "vitest";

import { defaultLanguage, supportedLanguages } from "../lib/index";

function detectLanguage(cookie: string, acceptLanguage: string): string {
  const match = cookie.match(/(?:^|;\s*)lang=(\w+)/);
  if (match && supportedLanguages.includes(match[1] as (typeof supportedLanguages)[number])) {
    return match[1];
  }

  for (const lang of supportedLanguages) {
    if (acceptLanguage.includes(lang)) return lang;
  }

  return defaultLanguage;
}

describe("getLanguage (logic)", () => {
  it("returns language from cookie (lang=en)", () => {
    expect(detectLanguage("lang=en", "")).toBe("en");
  });

  it("returns language from cookie (lang=vi)", () => {
    expect(detectLanguage("lang=vi", "")).toBe("vi");
  });

  it("falls through unsupported cookie to accept-language (en)", () => {
    expect(detectLanguage("lang=fr", "en-US,en;q=0.9")).toBe("en");
  });

  it("falls through unsupported cookie to accept-language (vi)", () => {
    expect(detectLanguage("lang=fr", "vi-VN,vi;q=0.9")).toBe("vi");
  });

  it("returns default language when no cookie and no accept-language", () => {
    expect(detectLanguage("", "")).toBe("vi");
  });

  it("returns default when accept-language has no supported lang", () => {
    expect(detectLanguage("session=abc", "fr-FR,fr;q=0.9")).toBe("vi");
  });

  it("handles cookie with lang among other cookies", () => {
    expect(detectLanguage("session=abc; lang=en; theme=dark", "")).toBe("en");
  });

  it("lang=vi in cookie takes precedence over accept-language", () => {
    expect(detectLanguage("lang=vi", "en-US,en;q=0.9")).toBe("vi");
  });
});

describe("supportedLanguages", () => {
  it("includes vi and en", () => {
    expect(supportedLanguages).toContain("vi");
    expect(supportedLanguages).toContain("en");
    expect(supportedLanguages).toHaveLength(2);
  });

  it("default language is vi", () => {
    expect(defaultLanguage).toBe("vi");
  });
});
