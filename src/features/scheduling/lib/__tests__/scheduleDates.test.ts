import { describe, expect, it } from "vitest";

import { SCHEDULE_MIN_DELAY_MS } from "@/features/scheduling/constants/schedule";
import {
  isScheduleDateValid,
  maximumScheduleDate,
  nextScheduledMinute,
} from "@/features/scheduling/lib/scheduleDates";

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
