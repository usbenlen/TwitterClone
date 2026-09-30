import {
  CALENDAR_REFERENCE_YEAR,
  MILLISECONDS_PER_MINUTE,
} from "@/constants/date";
import { SCHEDULE, SCHEDULE_MIN_DELAY_MS } from "@/constants/schedule";

export const padDatePart = (value: number) => String(value).padStart(2, "0");

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function parseBirthDate(value?: string | null) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  return {
    year: match?.[1] ?? "",
    month: match ? String(Number(match[2])) : "",
    day: match ? String(Number(match[3])) : "",
  };
}

export function buildBirthDate(
  year: string,
  month: string,
  day: string,
  today = new Date(),
): string | null {
  if (!year || !month || !day) return null;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day) ||
    date > today
  )
    return null;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function maxBirthDay(
  year: string,
  month: string,
  today = new Date(),
): number {
  const days = daysInMonth(
    Number(year) || CALENDAR_REFERENCE_YEAR,
    Number(month) || 1,
  );
  return Number(year) === today.getFullYear() &&
    Number(month) === today.getMonth() + 1
    ? Math.min(days, today.getDate())
    : days;
}

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
