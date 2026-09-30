import { APP_LOCALE } from "@/constants/app";

export const MILLISECONDS_PER_SECOND = 1_000;
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const MILLISECONDS_PER_MINUTE =
  MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE;

// A leap year keeps February available while selecting an incomplete birth date.
export const CALENDAR_REFERENCE_YEAR = 2000;
export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: new Date(CALENDAR_REFERENCE_YEAR, index, 1).toLocaleDateString(
    APP_LOCALE,
    {
      month: "long",
    },
  ),
}));
