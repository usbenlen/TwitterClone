import { describe, expect, it } from "vitest";

import {
  buildBirthDate,
  maxBirthDay,
  parseBirthDate,
} from "@/features/profiles/lib/birthDate";
import { daysInMonth } from "@/shared/lib/date";

describe("birth dates", () => {
  const today = new Date(2026, 8, 30, 12);

  it.each([
    ["2000", "2", "29", "2000-02-29"],
    ["1900", "2", "29", null],
    ["2025", "2", "29", null],
    ["2026", "4", "31", null],
    ["2026", "9", "30", "2026-09-30"],
    ["2026", "10", "1", null],
    ["", "2", "1", null],
  ])("validates %s-%s-%s", (year, month, day, expected) => {
    expect(buildBirthDate(year!, month!, day!, today)).toBe(expected);
  });

  it("parses persisted dates without introducing a timezone offset", () => {
    expect(parseBirthDate("1995-09-15")).toEqual({
      year: "1995",
      month: "9",
      day: "15",
    });
    expect(parseBirthDate(null)).toEqual({ year: "", month: "", day: "" });
  });

  it("clamps days for leap years, incomplete dates and the current month", () => {
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(1900, 2)).toBe(28);
    expect(maxBirthDay("", "2", today)).toBe(29);
    expect(maxBirthDay("2026", "9", new Date(2026, 8, 10))).toBe(10);
    expect(maxBirthDay("2025", "9", today)).toBe(30);
  });
});
