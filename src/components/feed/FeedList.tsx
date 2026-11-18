import { skipToken } from "@reduxjs/toolkit/query";

import { TweetCard } from "@/components/tweet/index";
import { Spinner } from "@/ui/Spinner";

import { useGetReplyParentQuery } from "@/store/postsApi";
import { matches, type Target } from "@/store/posts/types";

import type { Tweet } from "@/types/tweet";
import type { User } from "@/types/user";

import { withAncestorContext } from "@/utils/ancestors";

interface FeedListProps {
  tweets: Tweet[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  variant?: "feed" | "replies" | "bookmarks";
  repostedBy?: Pick<User, "username" | "displayName">;
  showReplyContext?: boolean;
}

function ReplyTweetItem({ tweet, parent }: { tweet: Tweet; parent?: Tweet | null }) {
  return (
    <div className="relative">
      {parent && (
        <div className="relative">
          <div className="pointer-events-none absolute left-[35px] top-[59px] bottom-[-9px] z-thread w-0.5 rounded-full bg-[color-mix(in_oklab,var(--border)_95%,black)]" />

          <TweetCard
            tweet={parent}
            variant="feed"
            navigateToPost
            className="relative border-b-0"
          />
        </div>
      )}

      <TweetCard tweet={tweet} variant="feed" navigateToPost />
    </div>
  );
}

function ProfileReplyRow({ tweet }: { tweet: Tweet }) {
  const parentId = tweet.parentCommentId || tweet.postId;
  const target: Target | undefined = tweet.isComment && parentId && tweet.parentCommentId !== tweet.id
    ? { id: parentId, type: tweet.parentCommentId ? "comment" : "post" } : undefined;
  const ancestors = tweet.ancestors ?? [];
  const embedded = target && ancestors.find((ancestor) => matches(ancestor, target));
  const query = useGetReplyParentQuery(embedded ? skipToken : (target ?? skipToken), { refetchOnMountOrArgChange: 60 });

  const parent = embedded
    ? { ...embedded, ancestors: ancestors.slice(0, ancestors.indexOf(embedded)) }
    : query.isError ? undefined : query.currentData;

  return <ReplyTweetItem tweet={tweet} parent={parent} />;
}

function BookmarkReplyRow({ tweet }: { tweet: Tweet }) {
  const ancestors = tweet.ancestors ?? [];
  const parent = ancestors.at(-1);
  return <ReplyTweetItem tweet={tweet} parent={parent && withAncestorContext(parent, ancestors)} />;
}

function isReply(tweet: Tweet) {
  return tweet.isComment === true;
}

export default function FeedList({
  tweets,
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

  if (tweets.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  if (variant === "replies") {
    return (
      <>
        {tweets.map((tweet) => (
          <ProfileReplyRow
            key={`${tweet.isComment ? "comment" : "post"}:${tweet.id}`}
            tweet={tweet}
          />
        ))}
      </>
    );
  }

  if (variant === "bookmarks") {
    return (
      <>
        {tweets.map((tweet) =>
          isReply(tweet) ? (
            <BookmarkReplyRow
              key={`${tweet.isComment ? "comment" : "post"}:${tweet.id}`}
              tweet={tweet}
            />
          ) : (
            <TweetCard
              key={`${tweet.isComment ? "comment" : "post"}:${tweet.id}`}
              tweet={tweet}
              variant="feed"
            />
          ),
        )}
      </>
    );
  }

  return (
    <>
      {tweets.map((tweet) => (
        <TweetCard
          key={`${tweet.isComment ? "comment" : "post"}:${tweet.id}`}
          tweet={tweet}
          variant="feed"
          repostedBy={repostedBy}
          showReplyContext={showReplyContext}
        />
      ))}
    </>
  );
}
