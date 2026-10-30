import { createSlice } from "@reduxjs/toolkit";

import { STORAGE_KEYS } from "@/shared/constants/storage";
import { THEMES } from "@/shared/types/theme";

import type { PayloadAction } from "@reduxjs/toolkit";
import type { Theme } from "@/shared/types";

export const THEME_STORAGE_KEY = STORAGE_KEYS.THEME;

function initialTheme(): Theme {
  if (typeof localStorage === "undefined") return "system";
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
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
