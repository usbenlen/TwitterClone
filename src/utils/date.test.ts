import { describe, expect, it } from "vitest";
import { SCHEDULE_MIN_DELAY_MS } from "@/constants/schedule";
import {
  buildBirthDate,
  daysInMonth,
  isScheduleDateValid,
  maxBirthDay,
  maximumScheduleDate,
  nextScheduledMinute,
  parseBirthDate,
} from "./date";

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

describe("scheduling", () => {
  const now = new Date(2026, 8, 30, 12, 30, 20).getTime();

  it("rounds up to a minute with the minimum delay, including across midnight", () => {
    expect(nextScheduledMinute(now)).toEqual(new Date(2026, 8, 30, 12, 32));
    expect(
      nextScheduledMinute(new Date(2026, 11, 31, 23, 59, 20).getTime()),
    ).toEqual(new Date(2027, 0, 1, 0, 1));
  });

  it("preserves the existing Date.setMonth calendar behavior for the horizon", () => {
    expect(maximumScheduleDate(new Date(2026, 8, 30))).toEqual(
      new Date(2028, 2, 30),
    );
    expect(maximumScheduleDate(new Date(2026, 7, 31))).toEqual(
      new Date(2028, 2, 2),
    );
  });

  it("includes both boundaries and rejects past, too early, too late and invalid dates", () => {
    const maximum = maximumScheduleDate(new Date(now));
    expect(isScheduleDateValid(new Date(now), now, maximum)).toBe(false);
    expect(
      isScheduleDateValid(
        new Date(now + SCHEDULE_MIN_DELAY_MS - 1),
        now,
        maximum,
      ),
    ).toBe(false);
    expect(
      isScheduleDateValid(new Date(now + SCHEDULE_MIN_DELAY_MS), now, maximum),
    ).toBe(true);
    expect(isScheduleDateValid(maximum, now, maximum)).toBe(true);
    expect(
      isScheduleDateValid(new Date(maximum.getTime() + 1), now, maximum),
    ).toBe(false);
    expect(isScheduleDateValid(new Date(NaN), now, maximum)).toBe(false);
  });
});
