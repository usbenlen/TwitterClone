/** @format */

import { TweetHeader, TweetActions, TweetMedia } from "@/components/tweet";
import TweetPoll from "@/components/tweet/poll/TweetPoll";
import TweetLocation from "@/components/tweet/location/TweetLocation";
import TweetEmbed from "@/components/tweet/embed/TweetEmbed";

import { Avatar } from "@/ui";

import type { Tweet } from "@/types/tweet";

import { useTweetLike } from "@/hooks/useTweetLike";

interface TweetCardProps {
  tweet: Tweet;
}

export default function TweetCard({ tweet }: TweetCardProps) {
  const like = useTweetLike(tweet);

  return (
    <article className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 border-b border-border p-5 transition-colors hover:bg-muted/40">
      <div className="flex justify-center">
        <Avatar
          name={tweet.author.displayName}
          src={tweet.author.avatarUrl}
          className="size-11 shrink-0"
        />
      </div>

      <div className="min-w-0">
        <TweetHeader
          author={tweet.author}
          createdAt={tweet.createdAt}
          content={tweet.content}
        />

        {tweet.location && <TweetLocation location={tweet.location} />}

        {tweet.embed && <TweetEmbed embed={tweet.embed} />}

        {tweet.poll && <TweetPoll tweetId={tweet.id} poll={tweet.poll} />}

        <TweetMedia attachments={tweet.attachments} />

        <TweetActions
          likedByMe={like.likedByMe}
          likesCount={like.likesCount}
          repliesCount={tweet.repliesCount}
          retweetsCount={tweet.retweetsCount}
          onLike={like.toggleLike}
        />
      </div>
    </article>
  );
}
