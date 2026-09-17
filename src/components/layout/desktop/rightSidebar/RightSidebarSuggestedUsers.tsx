import { Loader2 } from "lucide-react";
import { Link } from "react-router";

import RightSidebarCard from "@/components/layout/desktop/rightSidebar/RightSidebarCard";
import { RecommendationUserItem } from "@/components/user";

import { useRecommendedUsers } from "@/hooks";
import { APP_ROUTES } from "@/constants/routes";

export default function RightSidebarSuggestedUsers() {
  const { users, isLoading, error, reload } = useRecommendedUsers("people", 3);

  if (!isLoading && !error && users.length === 0) return null;

  return (
    <RightSidebarCard title="Кого читати">
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
      ) : (
        <>
          <div>
            {users.map((user) => (
              <RecommendationUserItem key={user.id} user={user} compact />
            ))}
          </div>
          <Link
            to={APP_ROUTES.FOLLOW_RECOMMENDATIONS}
            className="-mx-4 -mb-4 mt-1 block rounded-b-2xl px-4 py-3 text-sm text-primary transition-colors hover:bg-muted/40"
          >
            Показати більше
          </Link>
        </>
      )}
    </RightSidebarCard>
  );
}
