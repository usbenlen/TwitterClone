import MediaGrid from "@/components/ui/MediaGrid";
import ComposerMediaItem from "@/components/composer/attachments/ComposerMediaItem";

import type { ComposerMedia } from "@/types/composer";

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
