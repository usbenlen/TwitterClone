import { TwemojiText } from "@/ui";

import TweetLocation from "@/components/tweet/location/TweetLocation";
import { LinkPreviewCard } from "@/components/tweet/linkPreview";
import TweetPoll from "@/components/tweet/poll/TweetPoll";
import TweetMedia from "@/components/tweet/TweetMedia";
import { QuotedTweetCard } from "@/components/tweet/quote";

import type { Tweet } from "@/types/tweet";
import { removePreviewUrl } from "@/utils/linkPreview";

interface TweetContentProps {
  tweet: Tweet;
  readOnly?: boolean;
}

export default function TweetContent({ tweet, readOnly = false }: TweetContentProps) {
  const displayContent = removePreviewUrl(
    tweet.content,
    tweet.linkPreview?.url,
  );

  return (
    <div className="min-w-0">
      {displayContent && (
        <TwemojiText
          text={displayContent}
          className="mt-1 wrap-break-word whitespace-pre-wrap"
        />
      )}

      {tweet.attachments.length > 0 && (
        <TweetMedia attachments={tweet.attachments} autoPlayVideos />
      )}

      {tweet.poll && (
        <TweetPoll tweetId={tweet.id} poll={tweet.poll} readOnly={readOnly} />
      )}

      {tweet.linkPreview && <LinkPreviewCard preview={tweet.linkPreview} />}

      {tweet.quote && <QuotedTweetCard quote={tweet.quote} />}

      {tweet.location && <TweetLocation location={tweet.location} />}
    </div>
  );
}
