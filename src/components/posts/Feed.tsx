import { useFeed } from "@/hooks/posts/useFeed";

import FeedList from "@/components/posts/FeedList";
import PageHeader from "@/components/navigation/PageHeader";
import PostComposer from "@/components/composer/PostComposer";

export default function Feed() {
  const { posts, isLoading, error } = useFeed();

  return (
    <section className="w-full max-w-3xl border-r border-border bg-background">
      <PageHeader title="Головна" showMobileLogo />

      <PostComposer />

      <FeedList
        posts={posts}
        isLoading={isLoading}
        error={error}
        emptyMessage="Поки що тут порожньо. Опублікуйте перший твіт!"
      />
    </section>
  );
}
