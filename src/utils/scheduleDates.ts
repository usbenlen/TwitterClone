import { MILLISECONDS_PER_MINUTE } from "@/constants/date";
import { SCHEDULE, SCHEDULE_MIN_DELAY_MS } from "@/constants/schedule";

export function nextScheduledMinute(now = Date.now()): Date {
  return new Date(
    Math.ceil((now + SCHEDULE_MIN_DELAY_MS) / MILLISECONDS_PER_MINUTE) *
      MILLISECONDS_PER_MINUTE,
  );
}

export function maximumScheduleDate(now = new Date()): Date {
  const date = new Date(now);
  date.setMonth(date.getMonth() + SCHEDULE.MAX_MONTHS_AHEAD);
  return date;
}

export function isScheduleDateValid(
  date: Date,
  now: number,
  maximum: Date,
): boolean {
  return (
    date.getTime() >= now + SCHEDULE_MIN_DELAY_MS &&
    date.getTime() <= maximum.getTime()
  );
}
