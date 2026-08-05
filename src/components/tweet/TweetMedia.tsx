/** @format */

import { MediaGrid } from "./media";
import MediaItem from "./media/MediaItem";

import type { MediaAttachment } from "@/types/media";

interface Props {
  attachments: MediaAttachment[];
}

export default function TweetMedia({ attachments }: Props) {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-3">
      <MediaGrid
        items={attachments}
        renderItem={(attachment) => (
          <MediaItem key={attachment.id} attachment={attachment} />
        )}
      />
    </div>
  );
}
