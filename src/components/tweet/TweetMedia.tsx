/** @format */

import { useState } from "react";

import { MediaItem, MediaGrid, MediaViewer } from "@/components/tweet/media";

import type { MediaAttachment } from "@/types/media";

interface Props {
  attachments: MediaAttachment[];
}

export default function TweetMedia({ attachments }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const isSingleVideo =
    attachments.length === 1 && attachments[0].type === "video";

  const handleOpen = (index: number) => {
    setViewerIndex(index);
  };

  if (attachments.length === 0) return null;

  return (
    <>
      <MediaGrid
        items={attachments}
        renderItem={(attachment, index) => (
          <MediaItem
            attachment={attachment}
            onOpen={() => handleOpen(index)}
            openOnClick={!isSingleVideo}
          />
        )}
      />

      {!isSingleVideo && (
        <MediaViewer
          attachments={attachments}
          currentIndex={viewerIndex ?? 0}
          open={viewerIndex !== null}
          onClose={() => setViewerIndex(null)}
          onChange={setViewerIndex}
        />
      )}
    </>
  );
}
