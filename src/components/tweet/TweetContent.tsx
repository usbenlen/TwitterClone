import { TwemojiText } from "@/ui";

import TweetLocation from "@/components/tweet/location/TweetLocation";
import TweetEmbed from "@/components/tweet/embed/TweetEmbed";
import TweetPoll from "@/components/tweet/poll/TweetPoll";
import TweetMedia from "@/components/tweet/TweetMedia";

import type { Tweet } from "@/types/tweet";

interface TweetContentProps {
  tweet: Tweet;
}

export default function TweetContent({ tweet }: TweetContentProps) {
  return (
    <div className="min-w-0">
      {tweet.content && (
        <TwemojiText
          text={tweet.content}
          className="mt-1 wrap-break-word whitespace-pre-wrap"
        />
      )}

      {tweet.attachments.length > 0 && (
        <TweetMedia attachments={tweet.attachments} />
      )}

      {tweet.poll && <TweetPoll tweetId={tweet.id} poll={tweet.poll} />}

      {tweet.embed && <TweetEmbed embed={tweet.embed} />}

      {tweet.location && <TweetLocation location={tweet.location} />}
    </div>
  );
}
