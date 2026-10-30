export const padDatePart = (value: number) => String(value).padStart(2, "0");

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
