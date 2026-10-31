import { useFeed } from "@/hooks/useFeed";

import FeedList from "@/components/feed/FeedList";
import { PageHeader } from "@/components/layout/pageHeader/index";
import { TweetComposer } from "@/components/tweet/index";
import { Button, Spinner } from "@/ui";

export default function Feed() {
  const {
    tweets,
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

      <TweetComposer />

      {(!error || tweets.length > 0) && (
        <FeedList
          tweets={tweets}
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
