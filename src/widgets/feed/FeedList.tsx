import { PostCard } from "@/features/content/components/posts";
import { withAncestorContext } from "@/features/content/lib/posts/ancestors";
import { Spinner } from "@/shared/ui";

import type { Post } from "@/features/content/types";
import type { User } from "@/features/profiles/types";

interface FeedListProps {
  posts: Post[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  variant?: "feed" | "replies" | "bookmarks";
  repostedBy?: Pick<User, "username" | "displayName">;
  showReplyContext?: boolean;
}

function ReplyPostItem({ post }: { post: Post }) {
  const parent = post.ancestors?.at(-1);

  const parentPost = parent
    ? withAncestorContext(parent, post.ancestors ?? [])
    : null;

  return (
    <div className="relative">
      {parentPost && (
        <div className="relative">
          <div className="pointer-events-none absolute left-[35px] top-[59px] bottom-[-9px] z-thread w-0.5 rounded-full bg-[color-mix(in_oklab,var(--border)_95%,black)]" />

          <PostCard
            post={parentPost}
            variant="feed"
            navigateToPost
            className="relative border-b-0"
          />
        </div>
      )}

      <PostCard post={post} variant="feed" navigateToPost />
    </div>
  );
}

function isReply(post: Post) {
  return post.isComment === true;
}

export default function FeedList({
  posts,
  isLoading = false,
  error,
  emptyMessage = "Поки що тут порожньо.",
  variant = "feed",
  repostedBy,
  showReplyContext = false,
}: FeedListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <p className="px-4 py-10 text-center text-sm text-destructive">{error}</p>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  if (variant === "replies") {
    return (
      <>
        {posts.map((post) => (
          <ReplyPostItem
            key={`${post.isComment ? "comment" : "post"}:${post.id}`}
            post={post}
          />
        ))}
      </>
    );
  }

  if (variant === "bookmarks") {
    return (
      <>
        {posts.map((post) =>
          isReply(post) ? (
            <ReplyPostItem
              key={`${post.isComment ? "comment" : "post"}:${post.id}`}
              post={post}
            />
          ) : (
            <PostCard
              key={`${post.isComment ? "comment" : "post"}:${post.id}`}
              post={post}
              variant="feed"
            />
          ),
        )}
      </>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard
          key={`${post.isComment ? "comment" : "post"}:${post.id}`}
          post={post}
          variant="feed"
          repostedBy={repostedBy}
          showReplyContext={showReplyContext}
        />
      ))}
    </>
  );
}
