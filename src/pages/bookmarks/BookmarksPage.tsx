import { useBookmarks } from "@/hooks/useBookmarks";

import { FeedHeader, FeedList } from "@/components/feed";

export default function BookmarksPage() {
  const { tweets, isLoading, error } = useBookmarks();

  return (
    <section className="w-full max-w-3xl border-r border-border bg-background">
      <FeedHeader title="Закладки" />

      <FeedList
        tweets={tweets}
        variant="bookmarks"
        isLoading={isLoading}
        error={error}
        emptyMessage="Ви ще не додали жодного поста в закладки. Зробіть це, щоб зберегти їх на майбутнє!"
      />
    </section>
  );
}
