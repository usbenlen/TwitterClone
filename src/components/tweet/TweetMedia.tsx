/** @format */

import { useState } from "react";

import { MediaItem, MediaGrid, MediaViewer } from "@/components/tweet/media";

import type { MediaAttachment } from "@/types/media";

interface Props {
  attachments?: MediaAttachment[] | null;
}

export default function TweetMedia({ attachments }: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const safeAttachments = Array.isArray(attachments) ? attachments : [];

  const isSingleVideo =
    safeAttachments.length === 1 && safeAttachments[0].type === "video";

  const handleOpen = (index: number) => {
    setViewerIndex(index);
  };

  if (safeAttachments.length === 0) return null;

  return (
    <>
      <MediaGrid
        items={safeAttachments}
        renderItem={(safeAttachment, index) => (
          <MediaItem
            attachment={safeAttachment}
            onOpen={() => handleOpen(index)}
            openOnClick={!isSingleVideo}
          />
        )}
      />

      {!isSingleVideo && (
        <MediaViewer
          attachments={safeAttachments}
          currentIndex={viewerIndex ?? 0}
          open={viewerIndex !== null}
          onClose={() => setViewerIndex(null)}
          onChange={setViewerIndex}
        />
      )}
    </>
  );
}
