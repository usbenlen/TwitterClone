import {
  APP_LOCALE,
  MILLISECONDS_PER_SECOND,
  SECONDS_PER_MINUTE,
  MINUTES_PER_HOUR,
  HOURS_PER_DAY,
} from "@/constants";

// Відносний час "2 хв", "3 год", "5 дн".
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const seconds = Math.floor(
    (Date.now() - date.getTime()) / MILLISECONDS_PER_SECOND,
  );

  if (seconds < SECONDS_PER_MINUTE) return "щойно";
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  if (minutes < MINUTES_PER_HOUR) return `${minutes} хв`;
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  if (hours < HOURS_PER_DAY) return `${hours} год`;
  const days = Math.floor(hours / HOURS_PER_DAY);
  if (days < 7) return `${days} дн`;

  return date.toLocaleDateString(APP_LOCALE, {
    day: "numeric",
    month: "short",
  });
}

// Повна дата для профілю: "Приєднався у березні 2024"
export function formatJoinDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(APP_LOCALE, {
    month: "long",
    year: "numeric",
  });
}

function parseDateOnly(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function formatBirthMonthDay(iso: string): string | null {
  const date = parseDateOnly(iso);
  if (!date) return null;

  return date.toLocaleDateString(APP_LOCALE, {
    day: "numeric",
    month: "long",
  });
}

export function getBirthYear(iso: string): string | null {
  return /^(\d{4})-\d{2}-\d{2}$/.exec(iso)?.[1] ?? null;
}

// Скорочення чисел: 1200 -> "1,2 тис"
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(".0", "")} тис`;
  return `${(n / 1_000_000).toFixed(1).replace(".0", "")} млн`;
}

const countPluralRules = new Intl.PluralRules(APP_LOCALE);

export function formatPostCount(count: number): string {
  const label = {
    one: "допис",
    few: "дописи",
    many: "дописів",
    other: "допису",
    zero: "дописів",
    two: "дописи",
  }[countPluralRules.select(count)];

  return `${formatCount(count)} ${label}`;
}

export function formatVoteCount(count: number): string {
  const label = {
    one: "голос",
    few: "голоси",
    many: "голосів",
    other: "голосу",
    zero: "голосів",
    two: "голоси",
  }[countPluralRules.select(count)];

  return `${count} ${label}`;
}

export function formatDateTime(
  value: string | Date | null | undefined,
  dateStyle: "medium" | "full" = "medium",
): string {
  const date = value instanceof Date ? value : new Date(value ?? "");
  if (!Number.isFinite(date.getTime())) return "Дата невідома";

  return new Intl.DateTimeFormat(APP_LOCALE, {
    dateStyle,
    timeStyle: "short",
  }).format(date);
}

const compactCountFormatter = new Intl.NumberFormat(APP_LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCompactCount(value: number): string {
  return compactCountFormatter.format(value);
}

export function formatMediaTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.ceil(seconds);
  return `${Math.floor(total / SECONDS_PER_MINUTE)}:${String(total % SECONDS_PER_MINUTE).padStart(2, "0")}`;
}
