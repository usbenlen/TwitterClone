import FeedList from "@/widgets/feed/FeedList";
import { PageHeader } from "@/widgets/navigation/pageHeader";
import PostComposer from "@/features/content/components/composer/PostComposer";
import { useFeed } from "@/features/content/hooks/posts/useFeed";

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
