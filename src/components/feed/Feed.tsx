/** @format */

import { useFeed } from "@/hooks/useFeed";

import { FeedHeader, FeedList } from "@/components/feed";
import { TweetComposer } from "@/components/tweet";

export default function Feed() {
  const { tweets, isLoading, error, prepend } = useFeed();

  return (
    <section className="w-full max-w-3xl border-r border-border bg-background">
      <FeedHeader title="Головна" />

      <TweetComposer onCreated={prepend} />

      <FeedList
        tweets={tweets}
        isLoading={isLoading}
        error={error}
        emptyMessage="Поки що тут порожньо. Опублікуйте перший твіт!"
      />
    </section>
  );
}
