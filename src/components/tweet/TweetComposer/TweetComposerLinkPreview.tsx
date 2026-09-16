import { LinkPreviewCard } from "@/components/tweet/linkPreview";

import type { LinkPreview } from "@/types/linkPreview";

interface Props {
  preview: LinkPreview | null;
  loading: boolean;
  onRemove: () => void;
}

export default function TweetComposerLinkPreview({
  preview,
  loading,
  onRemove,
}: Props) {
  if (preview) {
    return (
      <LinkPreviewCard preview={preview} onRemove={onRemove} className="mb-3" />
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
