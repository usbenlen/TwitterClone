/** @format */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Об'єднує класи Tailwind без конфліктів.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
