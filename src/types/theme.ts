/** @format */

/**
 * як додати нову тему:
 *  1. Додати назву сюди (напр. "dim")
 *  2. Додати блок [data-theme="dim"] у src/index.css
 *  3. Додати підпис у THEME_LABELS нижче
 */
export const THEMES = ["dark", "light"] as const;

export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  dark: "Темна",
  light: "Світла",
};
