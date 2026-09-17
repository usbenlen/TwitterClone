import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router";

import { PageHeader } from "@/components/layout/pageHeader";
import { RecommendationUserItem } from "@/components/user";
import { useRecommendedUsers } from "@/hooks";
import { Button, Tab } from "@/ui";

import type { RecommendationCategory } from "@/types";
import { APP_ROUTES } from "@/constants/routes";

const tabs: Array<{ value: RecommendationCategory; label: string }> = [
  { value: "people", label: "Кого читати" },
  { value: "creators", label: "Автори для вас" },
];

function parseCategory(value: string | null): RecommendationCategory {
  return value === "creators" ? "creators" : "people";
}

export default function FollowRecommendationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = parseCategory(searchParams.get("tab"));
  const {
    users,
    nextCursor,
    isLoading,
    isLoadingMore,
    error,
    reload,
    loadMore,
  } = useRecommendedUsers(category, 4);

  const selectCategory = (nextCategory: RecommendationCategory) => {
    setSearchParams({ tab: nextCategory }, { replace: true });
  };

  return (
    <section className="w-full max-w-3xl border-r border-border bg-background">
      <PageHeader
        title="Рекомендації"
        backTo={APP_ROUTES.HOME}
        footer={
          <nav
            className="flex"
            aria-label="Категорії рекомендацій"
            role="tablist"
          >
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={category === tab.value}
                onClick={() => selectCategory(tab.value)}
                className="flex flex-1 cursor-pointer justify-center rounded-t-sm px-4 pt-3 transition-colors hover:bg-muted"
              >
                <Tab active={category === tab.value}>{tab.label}</Tab>
              </button>
            ))}
          </nav>
        }
      />

      <div className="py-3">
        <h2 className="px-4 pb-2 text-xl font-bold text-foreground">
          Рекомендовано для вас
        </h2>

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
                  {isLoadingMore && <Loader2 className="size-4 animate-spin" />}
                  Показати ще
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
