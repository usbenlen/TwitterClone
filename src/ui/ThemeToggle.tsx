/** @format */
import { MoonIcon, SunIcon } from "@/shared/icons";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/utils/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted",
        className,
      )}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
