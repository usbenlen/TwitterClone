import RecommendationUserItem from "@/components/profiles/RecommendationUserItem";
import { ExploreSection } from "@/components/recommendations/ExploreSection";

import { SIDEBAR } from "@/constants/layout";
import { APP_ROUTES } from "@/constants/routes";

import { useRecommendedUsers } from "@/hooks/recommendations/useRecommendations";

import { Button, Spinner } from "@/components/ui";

export function ExploreAuthors() {
  const { users, isLoading, error, reload } = useRecommendedUsers(SIDEBAR.RECOMMENDED_USERS_LIMIT);

  return (
    <ExploreSection
      title="Кого читати"
      moreTo={users.length ? APP_ROUTES.FOLLOW_RECOMMENDATIONS : undefined}
    >
      {isLoading ? (
        <div
          className="flex justify-center py-8"
          aria-label="Завантаження рекомендацій"
        >
          <Spinner variant="inline" />
        </div>
      ) : (
        <>
          {users.slice(0, SIDEBAR.RECOMMENDED_USERS_LIMIT).map((user) => (
            <RecommendationUserItem key={user.id} user={user} />
          ))}
          {error ? (
            <div className="px-4 py-6 text-center">
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => void reload()}
              >
                Спробувати ще раз
              </Button>
            </div>
          ) : (
            users.length === 0 && (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                Поки що рекомендацій немає.
              </p>
            )
          )}
        </>
      )}
    </ExploreSection>
  );
}
