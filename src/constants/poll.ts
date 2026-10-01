import { MILLISECONDS_PER_MINUTE } from "@/constants/date";

export const POLL_COUNTDOWN_INTERVAL_MS = MILLISECONDS_PER_MINUTE;
export const POLL = {
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 4,
  DEFAULT_DURATION_MINUTES: 1440,
} as const;

export const POLL_DURATION_OPTIONS = [
  { value: 30, label: "30 хв" },
  { value: 60, label: "1 година" },
  { value: 360, label: "6 годин" },
  { value: 720, label: "12 годин" },
  { value: 1440, label: "1 день" },
  { value: 4320, label: "3 дні" },
  { value: 10080, label: "7 днів" },
] as const;
