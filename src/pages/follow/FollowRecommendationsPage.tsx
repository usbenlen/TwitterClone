import { useSearchParams } from "react-router";
import { Loader2 } from "lucide-react";

import { PageHeader } from "@/components/layout/pageHeader/index";
import { RecommendationUserItem } from "@/components/user/index";

import { useRecommendedUsers } from "@/hooks";

import { Button, Tab } from "@/ui";
import { RightSidebarTrendsList } from "@/components/layout/desktop/rightSidebar/RightSidebarTrendsCard";

import {
  APP_ROUTES,
  RECOMMENDATIONS_PAGE_LIMIT,
  TRENDS_PAGE_LIMIT,
} from "@/constants";

export default function FollowRecommendationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "trends" ? "trends" : "authors";
  const setActiveTab = (tab: "authors" | "trends") => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (tab === "trends") next.set("tab", tab);
      else next.delete("tab");
      return next;
    });
  };
  const {
    users,
    nextCursor,
    isLoading,
    isLoadingMore,
    error,
    reload,
    loadMore,
  } = useRecommendedUsers(RECOMMENDATIONS_PAGE_LIMIT);

  return (
    <section className="w-full max-w-3xl border-r border-border bg-background">
      <PageHeader
        title="Рекомендації"
        backTo={APP_ROUTES.HOME}
        className="border-b-0"
      />

      <nav
        className="flex min-w-0 overflow-x-auto border-b border-border"
        aria-label="Рекомендації"
      >
        <button
          type="button"
          aria-pressed={activeTab === "authors"}
          onClick={() => setActiveTab("authors")}
          className="flex min-w-max flex-1 justify-center rounded-t-sm px-2 pt-3 transition-colors hover:bg-muted sm:px-4 dark:hover:bg-surface-hover focus-visible:focus-indicator"
        >
          <Tab active={activeTab === "authors"}>Автори</Tab>
        </button>
        <button
          type="button"
          aria-pressed={activeTab === "trends"}
          onClick={() => setActiveTab("trends")}
          className="flex min-w-max flex-1 justify-center rounded-t-sm px-2 pt-3 transition-colors hover:bg-muted sm:px-4 dark:hover:bg-surface-hover focus-visible:focus-indicator"
        >
          <Tab active={activeTab === "trends"}>Популярне</Tab>
        </button>
      </nav>

      {activeTab === "authors" ? (
        <div className="py-3">
          {isLoading ? (
            <div
              className="flex justify-center py-14"
              aria-label="Завантаження рекомендацій"
            >
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : error && users.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void reload()}
                className="mt-4"
              >
                Спробувати ще раз
              </Button>
            </div>
          ) : users.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              Поки що рекомендацій немає.
            </p>
          ) : (
            <>
              <div>
                {users.map((user) => (
                  <RecommendationUserItem key={user.id} user={user} />
                ))}
              </div>

              {error && (
                <p
                  className="px-4 pt-4 text-center text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {nextCursor && (
                <div className="flex justify-center px-4 py-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void loadMore()}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    Показати ще
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="px-4 py-3" role="tabpanel" aria-label="Популярне">
          <RightSidebarTrendsList limit={TRENDS_PAGE_LIMIT} />
        </div>
      )}
    </section>
  );
}
