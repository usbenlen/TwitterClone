import LinkPreviewCard from "@/features/content/components/posts/LinkPreviewCard";

import type { LinkPreview } from "@/features/content/types";

interface Props {
  preview: LinkPreview | null;
  loading: boolean;
  onRemove: () => void;
  disabled?: boolean;
}

export default function ComposerLinkPreview({
  preview,
  loading,
  onRemove,
  disabled = false,
}: Props) {
  if (preview) {
    return (
      <LinkPreviewCard
        preview={preview}
        onRemove={onRemove}
        disabled={disabled}
        className="mb-3"
      />
    );
  }

  if (!loading) return null;

  return (
    <div
      className="mb-3 mt-3 aspect-video animate-pulse overflow-hidden rounded-2xl border border-border bg-muted"
      aria-label="Завантаження прев’ю посилання"
      role="status"
    >
      <span className="sr-only">Завантаження прев’ю посилання</span>
    </div>
  );
}
