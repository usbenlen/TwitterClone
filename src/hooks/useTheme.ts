import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { systemTheme, themeChanged } from "@/store/theme";
import type { Theme } from "@/types/theme";

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
