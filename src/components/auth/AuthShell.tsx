/** @format */
import type { ReactNode } from "react";
import { ThemeToggle } from "@/ui/ThemeToggle";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

// Спільна оболонка для сторінок входу та реєстрації
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-4">
        <span className="text-2xl font-extrabold text-primary">Chirp</span>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-extrabold tracking-tight text-balance text-foreground">
            {title}
          </h1>
          <p className="mt-2 text-muted-foreground text-pretty">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>
    </div>
  );
}
