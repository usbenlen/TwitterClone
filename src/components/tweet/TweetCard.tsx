/** @format */

import { TweetHeader, TweetContent, TweetActions } from "@/components/tweet";

import type { Tweet } from "@/types/tweet";
import { Avatar } from "@/ui";
import { useTweetLike } from "@/hooks/useTweetLike";

interface TweetCardProps {
  tweet: Tweet;
}

export default function TweetCard({ tweet }: TweetCardProps) {
  const like = useTweetLike(tweet);

  return (
    <article className="border-b border-border p-5 transition-colors hover:bg-muted/40">
      <div className="flex gap-3">
        <Avatar
          name={tweet.author.displayName}
          src={tweet.author.avatarUrl}
          className="size-11"
        />
        <div className="min-w-0 flex-1">
          <TweetHeader author={tweet.author} createdAt={tweet.createdAt} />

          <TweetContent content={tweet.content} />

          <TweetActions
            likedByMe={like.likedByMe}
            likesCount={like.likesCount}
            repliesCount={tweet.repliesCount}
            retweetsCount={tweet.retweetsCount}
            onLike={like.toggleLike}
          />
        </div>
      </div>
    </article>
  );
}
