/** @format */

import { Moon, Sun } from "lucide-react";

import { cn } from "@/utils/cn";
import { useTheme } from "@/hooks/useTheme";

interface ThemeSwitchProps {
  className?: string;
}

export function ThemeSwitch({ className }: ThemeSwitchProps) {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-muted p-2">
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
        </div>

        <div className="text-left">
          <p className="font-medium text-foreground">Тема</p>

          <p className="text-xs text-muted-foreground">
            {isDark ? "Темна" : "Світла"}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          isDark ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            isDark ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </div>
    </button>
  );
}
