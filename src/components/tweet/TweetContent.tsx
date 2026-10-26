import { TwemojiText } from "@/ui/index";

import { TweetLocation, LinkPreviewCard, TweetPoll, TweetMedia } from "@/components/tweet";
import { QuotedTweetCard } from "@/components/tweet/quote/index";

import type { Tweet } from "@/types/tweet";

import { removePreviewUrl } from "@/utils/linkPreview";
import { normalizeDisplayText } from "@/utils/displayText";

interface TweetContentProps {
  tweet: Tweet;
  readOnly?: boolean;
}

export default function TweetContent({
  tweet,
  readOnly = false,
}: TweetContentProps) {
  const displayContent = normalizeDisplayText(removePreviewUrl(tweet.content, tweet.linkPreview?.url));

  return (
    <div className="min-w-0">
      {displayContent && (
        <TwemojiText
          text={displayContent}
          className="block min-w-0 overflow-hidden wrap-anywhere whitespace-pre-wrap"
        />
      )}

      {tweet.attachments.length > 0 && (
        <TweetMedia attachments={tweet.attachments} autoPlayVideos />
      )}

      {tweet.poll && (
        <TweetPoll
          isComment={tweet.isComment}
          tweetId={tweet.id}
          poll={tweet.poll}
          readOnly={readOnly}
        />
      )}

      {tweet.linkPreview && <LinkPreviewCard preview={tweet.linkPreview} />}

      {tweet.quote && (
        <QuotedTweetCard quote={tweet.quote} readOnly={readOnly} />
      )}

      {tweet.location && <TweetLocation location={tweet.location} />}
    </div>
  );
}
