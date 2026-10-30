import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

// Об'єднує класи Tailwind без конфліктів
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
