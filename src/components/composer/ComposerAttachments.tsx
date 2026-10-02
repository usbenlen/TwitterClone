import type { useTweetComposer } from "@/hooks/composer/useTweetComposer";
import type { TweetQuote } from "@/types";
import {
  TweetComposerMediaPreview,
  TweetComposerLocationPreview,
  TweetComposerLinkPreview,
} from "@/components/tweet/TweetComposer/index";
import { QuotedTweetCard } from "@/components/tweet/quote/index";
import PollComposer from "@/components/composer/poll/PollComposer";

interface ComposerAttachmentsProps {
  composer: ReturnType<typeof useTweetComposer>;
  quotedTweet?: TweetQuote | null;
}

export function ComposerAttachments({
  composer,
  quotedTweet,
}: ComposerAttachmentsProps) {
  return (
    <>
      {composer.pollEditor.visible && <PollComposer {...composer.pollEditor} />}

      <TweetComposerMediaPreview
        media={composer.media}
        onRemove={composer.removeMedia}
        disabled={composer.isPosting}
      />

      {composer.linkPreview.visible && (
        <TweetComposerLinkPreview
          preview={composer.linkPreview.preview}
          loading={composer.linkPreview.loading}
          onRemove={composer.linkPreview.onRemove}
          disabled={composer.isPosting}
        />
      )}

      {quotedTweet && <QuotedTweetCard quote={quotedTweet} />}

      {composer.locationPreview.visible &&
        composer.locationPreview.location && (
          <TweetComposerLocationPreview
            location={composer.locationPreview.location}
            onRemove={composer.locationPreview.onRemove}
            disabled={composer.isPosting}
          />
        )}
    </>
  );
}
