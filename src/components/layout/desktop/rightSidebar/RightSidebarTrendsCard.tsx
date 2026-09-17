import { Loader2 } from "lucide-react";
import { Link } from "react-router";

import RightSidebarCard from "@/components/layout/desktop/rightSidebar/RightSidebarCard";

import { useTrends } from "@/hooks";
import { APP_ROUTES } from "@/constants/routes";

const postCountFormatter = new Intl.NumberFormat("uk-UA", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export default function RightSidebarTrendsCard() {
  const { trends, isLoading, error, reload } = useTrends(4);

  if (!isLoading && !error && trends.length === 0) return null;

  return (
    <RightSidebarCard title="Популярне">
      {isLoading ? (
        <div className="flex justify-center py-6" aria-label="Завантаження тем">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : error ? (
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
      ) : (
        <div className="-mx-4">
          {trends.map((trend) => (
            <Link
              key={trend.id}
              to={APP_ROUTES.search({ query: trend.query, type: "posts" })}
              className="block px-4 py-2.5 transition-colors hover:bg-muted/40"
            >
              <p className="truncate text-xs text-muted-foreground">
                {trend.context}
              </p>
              <p className="mt-0.5 truncate text-sm font-bold text-foreground">
                {trend.title}
              </p>
              {trend.postsCount !== undefined && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {postCountFormatter.format(trend.postsCount)} дописів
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </RightSidebarCard>
  );
}
