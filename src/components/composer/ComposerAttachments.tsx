import type { useTweetComposer } from "@/hooks/composer/useTweetComposer";
import type { TweetQuote } from "@/types";
import {
  TweetComposerMediaPreview,
  TweetComposerPollPreview,
  TweetComposerLocationPreview,
  TweetComposerLinkPreview,
} from "@/components/tweet/TweetComposer/index";
import { QuotedTweetCard } from "@/components/tweet/quote/index";

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
      <TweetComposerMediaPreview
        media={composer.media}
        onRemove={composer.removeMedia}
      />

      {composer.pollPreview.visible && (
        <TweetComposerPollPreview
          poll={composer.pollPreview.poll}
          onRemove={composer.pollPreview.onRemove}
        />
      )}

      {composer.locationPreview.visible &&
        composer.locationPreview.location && (
          <TweetComposerLocationPreview
            location={composer.locationPreview.location}
            onRemove={composer.locationPreview.onRemove}
          />
        )}

      {composer.linkPreview.visible && (
        <TweetComposerLinkPreview
          preview={composer.linkPreview.preview}
          loading={composer.linkPreview.loading}
          onRemove={composer.linkPreview.onRemove}
        />
      )}

      {quotedTweet && <QuotedTweetCard quote={quotedTweet} />}
    </>
  );
}
