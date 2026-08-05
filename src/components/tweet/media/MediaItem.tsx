/** @format */

import type { MediaAttachment } from "@/types/media";

interface MediaItemProps {
  attachment: MediaAttachment;
}

export default function MediaItem({ attachment }: MediaItemProps) {
  const isImage = attachment.type === "image" || attachment.type === "gif";

  if (isImage) {
    return (
      <img
        src={attachment.url}
        alt=""
        className="size-full rounded-xl border border-border object-cover"
      />
    );
  }

  if (attachment.type === "video") {
    return (
      <video
        src={attachment.url}
        controls
        className="size-full rounded-xl border border-border object-cover"
      />
    );
  }

  return null;
}
