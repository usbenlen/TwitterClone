import { Loader2 } from "lucide-react";

import { PageHeader } from "@/components/layout/pageHeader/index";
import { RecommendationUserItem } from "@/components/user/index";

import { useRecommendedUsers } from "@/hooks";

import { Button } from "@/ui";

import { APP_ROUTES, RECOMMENDATIONS_PAGE_LIMIT } from "@/constants";

export default function FollowRecommendationsPage() {
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
        title="Рекомендовані автори"
        backTo={APP_ROUTES.HOME}
      />

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
