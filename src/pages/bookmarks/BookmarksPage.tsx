import { useBookmarks } from "@/hooks/posts/useBookmarks";

import FeedList from "@/components/posts/FeedList";
import PageHeader from "@/components/navigation/PageHeader";

export default function BookmarksPage() {
  const { posts, isLoading, error } = useBookmarks();

  return (
    <section className="w-full max-w-3xl border-r border-border bg-background">
      <PageHeader title="Закладки" />

      <FeedList
        posts={posts}
        variant="bookmarks"
        isLoading={isLoading}
        error={error}
        emptyMessage="Ви ще не додали жодного поста в закладки. Зробіть це, щоб зберегти їх на майбутнє!"
      />
    </section>
  );
}
