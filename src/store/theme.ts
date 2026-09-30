import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { THEMES, type Theme } from "@/types/theme";

const STORAGE_KEY = "tc_theme";

function initialTheme(): Theme {
  if (typeof localStorage === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  return stored && THEMES.includes(stored) ? stored : "system";
}

export function systemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const themeSlice = createSlice({
  name: "theme",
  initialState: { value: initialTheme() },
  reducers: {
    themeChanged(state, action: PayloadAction<Theme>) {
      state.value = action.payload;
    },
  },
});

export const { themeChanged } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
export { STORAGE_KEY as THEME_STORAGE_KEY };
