import { skipToken } from "@reduxjs/toolkit/query";

import { PostCard } from "@/features/content/components/posts";
import { Spinner } from "@/shared/ui";
import type { Post, Target } from "@/features/content/types";
import type { User } from "@/features/profiles/types";
import { withAncestorContext } from "@/features/content/lib/posts/ancestors";
import { useGetReplyParentQuery } from "@/features/content/api/postQueries";
import { matches } from "@/features/content/model/postTargets";

interface FeedListProps {
  posts: Post[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  variant?: "feed" | "replies" | "bookmarks";
  repostedBy?: Pick<User, "username" | "displayName">;
  showReplyContext?: boolean;
}

function ReplyPostItem({ post, parent }: { post: Post; parent?: Post | null }) {
  return (
    <div className="relative">
      {parent && (
        <div className="relative">
          <div className="pointer-events-none absolute left-[35px] top-[59px] bottom-[-9px] z-thread w-0.5 rounded-full bg-[color-mix(in_oklab,var(--border)_95%,black)]" />

          <PostCard
            post={parent}
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

function ProfileReplyRow({ post }: { post: Post }) {
  const parentId = post.parentCommentId || post.postId;
  const target: Target | undefined = post.isComment && parentId && post.parentCommentId !== post.id
    ? { id: parentId, type: post.parentCommentId ? "comment" : "post" } : undefined;
  const ancestors = post.ancestors ?? [];
  const embedded = target && ancestors.find((ancestor) => matches(ancestor, target));
  const query = useGetReplyParentQuery(embedded ? skipToken : (target ?? skipToken), { refetchOnMountOrArgChange: 60 });

  const parent = embedded
    ? { ...embedded, ancestors: ancestors.slice(0, ancestors.indexOf(embedded)) }
    : query.isError ? undefined : query.currentData;

  return <ReplyPostItem post={post} parent={parent} />;
}

function BookmarkReplyRow({ post }: { post: Post }) {
  const ancestors = post.ancestors ?? [];
  const parent = ancestors.at(-1);
  return <ReplyPostItem post={post} parent={parent && withAncestorContext(parent, ancestors)} />;
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
          <ProfileReplyRow
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
            <BookmarkReplyRow
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
