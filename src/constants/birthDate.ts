import { APP_LOCALE } from "@/constants/app";

// A leap year keeps February available while selecting an incomplete birth date
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
