import { Loader2 } from "lucide-react";
import { Link } from "react-router";

import { SIDEBAR } from "@/constants/layout";
import { APP_ROUTES } from "@/constants/routes";

import RightSidebarCard from "@/components/navigation/desktop/RightSidebarCard";
import { sidebarCardActionClassName } from "@/components/navigation/desktop/RightSidebarCard";
import RecommendationUserItem from "@/components/profiles/RecommendationUserItem";

import { useRecommendedUsers } from "@/hooks/recommendations/useRecommendations";

export default function RightSidebarSuggestedUsers() {
  const { users, isLoading, error, reload } = useRecommendedUsers(
    SIDEBAR.RECOMMENDED_USERS_LIMIT,
  );

  return (
    <RightSidebarCard
      title="Кого читати"
      footer={
        !isLoading && !error && users.length > 0 ? (
          <Link
            to={APP_ROUTES.FOLLOW_RECOMMENDATIONS}
            className={sidebarCardActionClassName}
          >
            Показати більше
          </Link>
        ) : undefined
      }
    >
      {isLoading ? (
        <div
          className="flex justify-center py-6"
          aria-label="Завантаження рекомендацій"
        >
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
      ) : users.length === 0 ? (
        <p className="py-3 text-sm text-muted-foreground">Ще немає</p>
      ) : (
        <div>
          {users.map((user) => (
            <RecommendationUserItem key={user.id} user={user} compact />
          ))}
        </div>
      )}
    </RightSidebarCard>
  );
}
