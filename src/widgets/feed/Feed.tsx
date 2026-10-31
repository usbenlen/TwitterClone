import FeedList from "@/widgets/feed/FeedList";
import { PageHeader } from "@/widgets/navigation/pageHeader";
import PostComposer from "@/features/content/components/composer/PostComposer";
import { useFeed } from "@/features/content/hooks/posts/useFeed";
import { Button, Spinner } from "@/shared/ui";

export default function Feed() {
  const {
    posts,
    isLoading,
    isFetching,
    isLoadingMore,
    hasMore,
    error,
    loadMoreRef,
    retry,
  } = useFeed();

  return (
    <section className="w-full max-w-3xl border-r border-border bg-background">
      <PageHeader title="Головна" showMobileLogo />

      <PostComposer />

      {(!error || posts.length > 0) && (
        <FeedList
          posts={posts}
          isLoading={isLoading}
          emptyMessage="Поки що тут порожньо. Опублікуйте перший твіт!"
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
    </section>
  );
}
