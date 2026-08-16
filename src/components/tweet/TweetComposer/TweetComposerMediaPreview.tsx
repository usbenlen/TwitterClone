import { MediaGrid, ComposerMediaItem } from "@/components/tweet/media";

import type { ComposerMedia } from "@/types/composer";

interface TweetComposerMediaPreviewProps {
  media: ComposerMedia[];
  onRemove: (id: string) => void;
}

export default function TweetComposerMediaPreview({
  media,
  onRemove,
}: TweetComposerMediaPreviewProps) {
  return (
    <MediaGrid
      items={media}
      renderItem={(item) => (
        <ComposerMediaItem key={item.id} media={item} onRemove={onRemove} />
      )}
    />
  );
}
