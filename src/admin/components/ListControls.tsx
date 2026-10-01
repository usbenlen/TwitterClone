import type { ReactNode } from "react";

import { Button } from "@/ui/Button";
import { Spinner } from "@/ui/Spinner";

import { errorMessage } from "@/store/api";

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex min-w-36 flex-col gap-1 text-sm text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-10 rounded-xl border border-border bg-background px-3 text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {Object.entries(options).map(([key, title]) => (
          <option key={key} value={key}>
            {String(title)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Pagination({
  page,
  totalPages,
  total,
  busy,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  busy?: boolean;
  onChange: (page: number) => void;
}) {
  return (
    <nav
      aria-label="Сторінки результатів"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
    >
      <span className="text-sm text-muted-foreground">
        Усього: {total} · Сторінка {page} з {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={busy || page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Назад
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Далі
        </Button>
      </div>
    </nav>
  );
}

export function QueryState({
  loading,
  error,
  empty,
  retry,
  children,
}: {
  loading?: boolean;
  error?: unknown;
  empty?: boolean;
  retry: () => unknown;
  children: ReactNode;
}) {
  if (loading)
    return (
      <div role="status" className="flex justify-center p-10">
        <Spinner variant="inline" />{" "}
        <span className="sr-only">Завантаження</span>
      </div>
    );
  if (error)
    return (
      <div
        role="alert"
        className="space-y-3 rounded-xl border border-destructive/40 p-5"
      >
        <p className="text-destructive">{errorMessage(error)}</p>
        <Button variant="outline" onClick={() => void retry()}>
          Спробувати знову
        </Button>
      </div>
    );
  if (empty)
    return (
      <p role="status" className="p-10 text-center text-muted-foreground">
        Нічого не знайдено.
      </p>
    );
  return children;
}
