import { useFeed } from "@/hooks/useFeed";

import FeedList from "@/components/feed/FeedList";
import { PageHeader } from "@/components/layout/pageHeader/index";
import { TweetComposer } from "@/components/tweet/index";

export default function Feed() {
  const { tweets, isLoading, error } = useFeed();

  return (
    <section className="w-full max-w-3xl border-r border-border bg-background">
      <PageHeader title="Головна" showMobileLogo />

      <TweetComposer />

      <FeedList
        tweets={tweets}
        isLoading={isLoading}
        error={error}
        emptyMessage="Поки що тут порожньо. Опублікуйте перший твіт!"
      />
    </section>
  );
}
