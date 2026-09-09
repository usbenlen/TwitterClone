import { TweetCard } from "@/components/tweet";
import { Spinner } from "@/ui/Spinner";

import type { Tweet } from "@/types/tweet";

import { withAncestorContext } from "@/utils/ancestors.ts";

interface FeedListProps {
  tweets: Tweet[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  variant?: "feed" | "replies" | "bookmarks";
}

function ReplyTweetItem({ tweet }: { tweet: Tweet }) {
  const parent = tweet.ancestors?.at(-1);

  const parentTweet = parent
    ? withAncestorContext(parent, tweet.ancestors ?? [])
    : null;

  return (
    <div className="relative">
      {parentTweet && (
        <div className="relative">
          <div className="pointer-events-none absolute left-[35px] top-[59px] bottom-[-9px] z-thread w-0.5 rounded-full bg-[color-mix(in_oklab,var(--border)_95%,black)]" />

          <TweetCard
            tweet={parentTweet}
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

function isReply(tweet: Tweet) {
  return tweet.isComment === true;
}

export default function FeedList({
  tweets,
  isLoading = false,
  error,
  emptyMessage = "Поки що тут порожньо.",
  variant = "feed",
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
          <ReplyTweetItem key={tweet.id} tweet={tweet} />
        ))}
      </>
    );
  }

  if (variant === "bookmarks") {
    return (
      <>
        {tweets.map((tweet) =>
          isReply(tweet) ? (
            <ReplyTweetItem key={tweet.id} tweet={tweet} />
          ) : (
            <TweetCard key={tweet.id} tweet={tweet} variant="feed" />
          ),
        )}
      </>
    );
  }

  return (
    <>
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} variant="feed" />
      ))}
    </>
  );
}
