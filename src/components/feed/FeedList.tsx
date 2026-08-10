/** @format */

import TweetCard from "@/components/tweet/TweetCard";
import { Spinner } from "@/ui/Spinner";

import type { Tweet } from "@/types/tweet";

interface FeedListProps {
  tweets: Tweet[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

export default function FeedList({
  tweets,
  isLoading = false,
  error,
  emptyMessage = "Поки що тут порожньо.",
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

  return (
    <>
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </>
  );
}
