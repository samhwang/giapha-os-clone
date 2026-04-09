import dayjs from "dayjs";
import { describe, expect, it } from "vitest";

import { dateLib, formatDateInTimeZone, getUserTimeZone, nowInTimeZone } from "./date";

describe("getUserTimeZone", () => {
  it("returns a non-empty string", () => {
    const tz = getUserTimeZone();
    expect(typeof tz).toBe("string");
    expect(tz.length).toBeGreaterThan(0);
  });

  it("returns a valid time zone identifier", () => {
    const tz = getUserTimeZone();
    // Intl.DateTimeFormat().resolvedOptions().timeZone returns valid IANA timezone
    expect(tz).toMatch(/^([A-Za-z_]+\/[A-Za-z_]+|UTC)$/);
  });
});

describe("nowInTimeZone", () => {
  it("returns a dayjs object", () => {
    const result = nowInTimeZone("Asia/Ho_Chi_Minh");
    expect(dateLib.isDayjs(result)).toBe(true);
  });

  it("uses the provided timezone", () => {
    const result = nowInTimeZone("Asia/Tokyo");
    // Verify it's in the correct timezone by checking the offset
    const tz = result.format("Z");
    // Tokyo is UTC+9
    expect(tz).toBe("+09:00");
  });

  it("defaults to user timezone when no argument provided", () => {
    const result = nowInTimeZone();
    expect(dateLib.isDayjs(result)).toBe(true);
  });
});

describe("formatDateInTimeZone", () => {
  it("formats a Date object in the specified timezone", () => {
    const date = new Date("2024-06-15T23:00:00Z"); // UTC
    const formatted = formatDateInTimeZone(date, "Asia/Ho_Chi_Minh");
    // +7 hours: 23:00 UTC -> 06:00 next day
    expect(formatted).toBe("2024-06-16");
  });

  it("formats a string date in the specified timezone", () => {
    const formatted = formatDateInTimeZone("2024-06-15T23:00:00Z", "America/New_York");
    // -4 hours (EDT): 23:00 UTC -> 19:00 same day
    expect(formatted).toBe("2024-06-15");
  });

  it("defaults to user timezone when no timezone specified", () => {
    const date = new Date("2024-01-01T00:00:00Z");
    const formatted = formatDateInTimeZone(date);
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("formats dayjs object", () => {
    const d = dayjs("2024-06-15T23:00:00Z");
    const formatted = formatDateInTimeZone(d, "Asia/Tokyo");
    // +9 hours: 23:00 UTC -> 08:00 next day
    expect(formatted).toBe("2024-06-16");
  });
});
