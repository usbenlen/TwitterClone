import { LinkPreviewCard } from "@/components/tweet/linkPreview/index";

import type { LinkPreview } from "@/types/linkPreview";

interface Props {
  preview: LinkPreview;
  onRemove: () => void;
  disabled?: boolean;
}

export default function TweetComposerLinkPreview({
  preview,
  onRemove,
  disabled = false,
}: Props) {
  return (
    <LinkPreviewCard
      preview={preview}
      onRemove={onRemove}
      disabled={disabled}
      className="mb-3"
    />
  );
}
