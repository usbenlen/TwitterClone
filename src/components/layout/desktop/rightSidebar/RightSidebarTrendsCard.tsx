import { Loader2 } from "lucide-react";
import { Link } from "react-router";

import { formatCompactCount } from "@/utils/format";
import { SIDEBAR, APP_ROUTES } from "@/constants";
import RightSidebarCard, {
  sidebarCardActionClassName,
} from "@/components/layout/desktop/rightSidebar/RightSidebarCard";
import { useTrends } from "@/hooks";

function TrendsListContent({
  result,
}: {
  result: ReturnType<typeof useTrends>;
}) {
  const { trends, isLoading, error, reload } = result;

  if (isLoading) {
    return (
      <div className="flex justify-center py-6" aria-label="Завантаження тем">
        <Loader2 className="size-5 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-3 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <button
          type="button"
          onClick={() => void reload()}
          className="mt-2 cursor-pointer text-sm font-semibold text-primary hover:underline"
        >
          Спробувати ще раз
        </button>
      </div>
    );
  }

  if (trends.length === 0) {
    return <p className="py-3 text-sm text-muted-foreground">Ще немає</p>;
  }

  return (
    <div className="-mx-4">
      {trends.map((trend) => (
        <Link
          key={trend.id}
          to={APP_ROUTES.search({ query: trend.query, type: "posts" })}
          className="block px-4 py-2.5 transition-colors hover:bg-muted/40 dark:hover:bg-surface-hover dark:active:bg-muted focus-visible:focus-indicator"
        >
          <p className="truncate text-xs text-muted-foreground">
            {trend.context}
          </p>
          <p className="mt-0.5 truncate text-sm font-bold text-foreground">
            {trend.title}
          </p>
          {trend.postsCount !== undefined && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatCompactCount(trend.postsCount)} дописів
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}

export function RightSidebarTrendsList({
  limit = SIDEBAR.TRENDS_LIMIT,
}: {
  limit?: number;
}) {
  return <TrendsListContent result={useTrends(limit)} />;
}

export default function RightSidebarTrendsCard() {
  const result = useTrends(SIDEBAR.TRENDS_LIMIT);
  const showMore =
    !result.isLoading && !result.error && result.trends.length > 0;

  return (
    <RightSidebarCard
      title="Популярне"
      footer={
        showMore ? (
          <Link
            to={APP_ROUTES.followRecommendations("trends")}
            className={sidebarCardActionClassName}
          >
            Показати більше
          </Link>
        ) : undefined
      }
    >
      <TrendsListContent result={result} />
    </RightSidebarCard>
  );
}
