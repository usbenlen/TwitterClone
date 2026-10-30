import { Frown } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router";

import { TREND_FEEDBACK_OPTIONS } from "@/features/discovery/constants/trendFeedback";
import { APP_ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/cn";
import { formatCompactCount } from "@/shared/lib/format";
import { ActionsMenu, Spinner } from "@/shared/ui";

import type {
  TrendFeedbackReason,
  TrendRecommendation,
} from "@/features/discovery/types";

interface TrendsListProps {
  trends: TrendRecommendation[];
  isLoading?: boolean;
  error?: string | null;
  feedbackError?: string;
  reload: () => unknown;
  numbered?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  onDismiss?: (trendId: string, reason: TrendFeedbackReason) => void;
  onEmptyFocus?: () => void;
}

export function TrendsList({
  trends,
  isLoading,
  error,
  feedbackError,
  reload,
  numbered = false,
  compact = false,
  emptyMessage = "Ще немає",
  onDismiss,
  onEmptyFocus,
}: TrendsListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const focusIndex = useRef<number | null>(null);
  useEffect(() => {
    if (focusIndex.current === null) return;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>(
      "[data-actions-menu-trigger]",
    );
    const next = buttons?.[Math.min(focusIndex.current, buttons.length - 1)];
    focusIndex.current = null;
    if (next) next.focus();
    else onEmptyFocus?.();
  }, [trends, onEmptyFocus]);

  if (isLoading)
    return (
      <div className="flex justify-center py-8" aria-label="Завантаження тем">
        <Spinner variant="inline" />
      </div>
    );

  if (error)
    return (
      <div className="px-4 py-6 text-center">
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
        <button
          type="button"
          onClick={() => void reload()}
          className="mt-2 cursor-pointer rounded text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Спробувати ще раз
        </button>
      </div>
    );

  if (trends.length === 0)
    return (
      <p className="px-4 py-6 text-sm text-muted-foreground">{emptyMessage}</p>
    );

  return (
    <div ref={listRef}>
      {feedbackError && (
        <p role="alert" className="px-4 py-3 text-sm text-destructive">
          {feedbackError}
        </p>
      )}
      {trends.map((trend, index) => (
        <div
          key={trend.id}
          className="relative transition-colors hover:bg-muted/40 dark:hover:bg-surface-hover"
        >
          <Link
            to={APP_ROUTES.search({ query: trend.query, type: "posts" })}
            className={cn(
              "block min-w-0 px-4 dark:active:bg-muted focus-visible:focus-indicator",
              compact ? "py-2.5" : "py-4",
              onDismiss && "pr-12",
            )}
          >
            <p
              className={cn(
                "text-xs leading-5 text-muted-foreground",
                compact && "truncate",
              )}
            >
              {numbered && <span className="text-primary">{index + 1} · </span>}
              {trend.context}
            </p>
            <p
              className={cn(
                "mt-0.5 font-bold leading-6 text-foreground",
                compact ? "truncate text-sm" : "wrap-break-word text-base",
              )}
            >
              {trend.title}
            </p>
            {trend.postsCount !== undefined && (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCompactCount(trend.postsCount)} дописів
              </p>
            )}
          </Link>
          {onDismiss && (
            <ActionsMenu
              ariaLabel={`Дії для теми «${trend.title}»`}
              menuLabel={`Відгук про тему «${trend.title}»`}
              triggerClassName="absolute right-1 top-1"
              menuClassName="w-80"
              items={TREND_FEEDBACK_OPTIONS.map((option) => ({
                id: option.reason,
                label: option.label,
                icon: Frown,
                onSelect: () => {
                  focusIndex.current = index;
                  onDismiss(trend.id, option.reason);
                },
              }))}
            />
          )}
        </div>
      ))}
    </div>
  );
}
