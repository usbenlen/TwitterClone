import type { usePostComposer } from "@/hooks/composer/usePostComposer";

import type { PostQuote } from "@/types/post";

import ComposerMediaPreview from "@/components/composer/attachments/ComposerMediaPreview";
import ComposerLocationPreview from "@/components/composer/location/ComposerLocationPreview";
import ComposerLinkPreview from "@/components/composer/links/ComposerLinkPreview";
import QuotedPostCard from "@/components/posts/QuotedPostCard";
import PollComposer from "@/components/composer/poll/PollComposer";

interface ComposerAttachmentsProps {
  composer: ReturnType<typeof usePostComposer>;
  quotedPost?: PostQuote | null;
}

export function ComposerAttachments({
  composer,
  quotedPost,
}: ComposerAttachmentsProps) {
  return (
    <>
      {composer.pollEditor.visible && <PollComposer {...composer.pollEditor} />}

      <ComposerMediaPreview
        media={composer.media}
        onRemove={composer.removeMedia}
        disabled={composer.isPosting}
      />

      {composer.linkPreview.visible && (
        <ComposerLinkPreview
          preview={composer.linkPreview.preview}
          loading={composer.linkPreview.loading}
          onRemove={composer.linkPreview.onRemove}
          disabled={composer.isPosting}
        />
      )}

      {quotedPost && (
        <QuotedPostCard quote={quotedPost} allowVoting={false} />
      )}

      {composer.locationPreview.visible &&
        composer.locationPreview.location && (
          <ComposerLocationPreview
            location={composer.locationPreview.location}
            onRemove={composer.locationPreview.onRemove}
            disabled={composer.isPosting}
          />
        )}
    </>
  );
}
