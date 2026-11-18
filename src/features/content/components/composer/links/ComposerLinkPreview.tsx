import LinkPreviewCard from "@/features/content/components/posts/LinkPreviewCard";

import type { LinkPreview } from "@/features/content/types";

interface Props {
  preview: LinkPreview;
  onRemove: () => void;
  disabled?: boolean;
}

export default function ComposerLinkPreview({
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
