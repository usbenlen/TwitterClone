import { useCallback, useEffect, useState, type ReactNode } from "react";

import { ThemeContext } from "@/providers";

import { THEMES, type Theme } from "@/types/theme";

const STORAGE_KEY = "tc_theme";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored && THEMES.includes(stored)) return stored;

  return "system";
}

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const applyTheme = () => {
      const actualTheme = theme === "system" ? getSystemTheme() : theme;
      document.documentElement.setAttribute("data-theme", actualTheme);
    };

    applyTheme();

    localStorage.setItem(STORAGE_KEY, theme);

    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      applyTheme();
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      if (current === "dark") return "light";
      if (current === "light") return "dark";

      return getSystemTheme() === "dark" ? "light" : "dark";
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
