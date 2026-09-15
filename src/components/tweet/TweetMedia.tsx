import { useState } from "react";

import { MediaItem, MediaGrid, MediaViewer } from "@/components/tweet/media";

import type { MediaAttachment } from "@/types/media";

interface Props {
  attachments?: MediaAttachment[] | null;
  autoPlayVideos?: boolean;
  variant?: "default" | "quote";
}

export default function TweetMedia({
  attachments,
  autoPlayVideos = false,
  variant = "default",
}: Props) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const safeAttachments = Array.isArray(attachments) ? attachments : [];

  const isSingleVideo =
    safeAttachments.length === 1 && safeAttachments[0].type === "video";
  const isQuote = variant === "quote";

  const handleOpen = (index: number) => {
    setViewerIndex(index);
  };

  if (safeAttachments.length === 0) return null;

  return (
    <>
      <div data-tweet-interactive="true">
        <MediaGrid
          items={safeAttachments}
          flush={isQuote}
          renderItem={(safeAttachment, index) => (
            <MediaItem
              attachment={safeAttachment}
              onOpen={() => handleOpen(index)}
              openOnClick={
                !isSingleVideo &&
                !(
                  isQuote &&
                  (safeAttachment.type === "video" ||
                    safeAttachment.type === "gif")
                )
              }
              autoPlayInline={
                autoPlayVideos && safeAttachment.type === "video"
              }
              flush={isQuote}
            />
          )}
        />
      </div>

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
