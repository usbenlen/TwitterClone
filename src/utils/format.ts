/** @format */

// Відносний час "2 хв", "3 год", "5 дн".
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "щойно";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} хв`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} год`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} дн`;

  return date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}

// Повна дата для профілю: "Приєднався у березні 2024"
export function formatJoinDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("uk-UA", { month: "long", year: "numeric" });
}

// Скорочення чисел: 1200 -> "1,2 тис"
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(".0", "")} тис`;
  return `${(n / 1_000_000).toFixed(1).replace(".0", "")} млн`;
}
