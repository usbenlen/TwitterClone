import { useCallback } from "react";

import {
  systemTheme,
  themeChanged,
} from "@/features/preferences/model/themeState";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";

import type { Theme } from "@/shared/types";

export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.value);

  const setTheme = useCallback(
    (nextTheme: Theme) => dispatch(themeChanged(nextTheme)),
    [dispatch],
  );

  const toggleTheme = useCallback(() => {
    const activeTheme = theme === "system" ? systemTheme() : theme;
    dispatch(themeChanged(activeTheme === "dark" ? "light" : "dark"));
  }, [dispatch, theme]);

  return { theme, setTheme, toggleTheme };
}
