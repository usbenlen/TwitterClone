import FeedList from "@/components/posts/FeedList";
import { ExploreSection } from "@/components/recommendations/ExploreSection";

import { useRecommendedPosts } from "@/hooks/recommendations/useRecommendedPosts";

import { Button, Spinner } from "@/components/ui";

export function ExplorePosts() {
  const {
    posts,
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
      {(!error || posts.length > 0) && (
        <FeedList
          posts={posts}
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
