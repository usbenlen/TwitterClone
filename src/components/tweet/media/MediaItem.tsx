/** @format */

import type { MediaAttachment } from "@/types/media";

interface MediaItemProps {
  attachment: MediaAttachment;
}

export default function MediaItem({ attachment }: MediaItemProps) {
  switch (attachment.type) {
    case "image":
    case "gif":
      return (
        <img
          src={attachment.url}
          alt=""
          className="size-full rounded-xl object-cover border border-border"
        />
      );

    case "video":
      return (
        <video
          src={attachment.url}
          controls
          className="size-full rounded-xl object-cover border border-border"
        />
      );

    default:
      return null;
  }
}
