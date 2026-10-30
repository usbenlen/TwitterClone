import { Monitor, Moon, Sun } from "lucide-react";

import { THEME_LABELS } from "@/shared/types/theme";

import type { Theme } from "@/shared/types";

export const THEME_OPTIONS = [
  { value: "light", label: THEME_LABELS.light, icon: Sun },
  { value: "dark", label: THEME_LABELS.dark, icon: Moon },
  { value: "system", label: THEME_LABELS.system, icon: Monitor },
] as const satisfies ReadonlyArray<{
  value: Theme;
  label: string;
  icon: typeof Sun;
}>;
