import FeedList from "@/components/feed/FeedList";
import { ExploreSection } from "@/components/explore/ExploreSection";

import { useRecommendedPosts } from "@/hooks/useRecommendedPosts";

import { Button, Spinner } from "@/ui";

export function ExplorePosts() {
  const {
    tweets,
    isLoading,
    isFetching,
    isLoadingMore,
    hasMore,
    error,
    loadMoreRef,
    retry,
  } = useRecommendedPosts();

  return (
    <ExploreSection title="Дописи для вас">
      {(!error || tweets.length > 0) && (
        <FeedList
          tweets={tweets}
          isLoading={isLoading}
          emptyMessage="Поки що рекомендованих дописів немає."
        />
      )}

      {error && (
        <div className="px-4 py-6 text-center">
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={isFetching}
            onClick={() => void retry()}
          >
            Спробувати ще раз
          </Button>
        </div>
      )}

      {hasMore && !error && (
        <>
          <div ref={loadMoreRef} className="h-px" aria-hidden="true" />
          {isLoadingMore && (
            <div
              role="status"
              aria-label="Завантаження дописів"
              className="flex justify-center px-4 py-5"
            >
              <Spinner variant="inline" />
            </div>
          )}
        </>
      )}
    </ExploreSection>
  );
}
