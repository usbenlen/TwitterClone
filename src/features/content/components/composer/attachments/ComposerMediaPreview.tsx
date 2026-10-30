import ComposerMediaItem from "@/features/content/components/composer/attachments/ComposerMediaItem";
import { MediaGrid } from "@/features/content/components/media";

import type { ComposerMedia } from "@/features/content/types";

interface PostComposerMediaPreviewProps {
  media: ComposerMedia[];
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export default function ComposerMediaPreview({
  media,
  onRemove,
  disabled = false,
}: PostComposerMediaPreviewProps) {
  return (
    <MediaGrid
      items={media}
      renderItem={(item) => (
        <ComposerMediaItem
          key={item.id}
          media={item}
          onRemove={onRemove}
          disabled={disabled}
        />
      )}
    />
  );
}
