import ComposerMediaPreview from "@/features/content/components/composer/attachments/ComposerMediaPreview";
import ComposerLinkPreview from "@/features/content/components/composer/links/ComposerLinkPreview";
import ComposerLocationPreview from "@/features/content/components/composer/location/ComposerLocationPreview";
import PollComposer from "@/features/content/components/composer/poll/PollComposer";
import QuotedPostCard from "@/features/content/components/posts/QuotedPostCard";

import type { usePostComposer } from "@/features/content/hooks/composer";
import type { PostQuote } from "@/features/content/types";

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
