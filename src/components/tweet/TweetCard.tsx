/** @format */

import { TweetHeader, TweetActions, TweetMedia } from "@/components/tweet";

import type { Tweet } from "@/types/tweet";

import { useTweetLike } from "@/hooks/useTweetLike";

interface TweetCardProps {
  tweet: Tweet;
}

export default function TweetCard({ tweet }: TweetCardProps) {
  const like = useTweetLike(tweet);

  return (
    <article className="border-b border-border p-5 transition-colors hover:bg-muted/40">
      <TweetHeader
        author={tweet.author}
        createdAt={tweet.createdAt}
        content={tweet.content}
      />

      <TweetMedia attachments={tweet.attachments} />

      <TweetActions
        likedByMe={like.likedByMe}
        likesCount={like.likesCount}
        repliesCount={tweet.repliesCount}
        retweetsCount={tweet.retweetsCount}
        onLike={like.toggleLike}
      />
    </article>
  );
}
