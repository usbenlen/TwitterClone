import { useFeed } from "@/hooks/useFeed";

import { FeedList } from "@/components/feed";
import { PageHeader } from "@/components/layout/pageHeader";
import { TweetComposer } from "@/components/tweet";

export default function Feed() {
  const { tweets, isLoading, error, prepend } = useFeed();

  return (
    <section className="w-full max-w-3xl border-r border-border bg-background">
      <PageHeader title="Головна" showMobileLogo />

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
