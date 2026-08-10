/** @format */

import { X } from "lucide-react";

import { cn } from "@/utils/cn";

import type { ComposerMedia } from "@/types/composer";

import { MEDIA_STATUS } from "@/constants/app";

import TweetComposerMediaStatus from "@/components/tweet/TweetComposer/TweetComposerMediaStatus";

interface ComposerMediaItemProps {
  media: ComposerMedia;
  className?: string;
  onRemove: (id: string) => void;
}

export default function ComposerMediaItem({
  media,
  className,
  onRemove,
}: ComposerMediaItemProps) {
  const isImage = media.type === "image" || media.type === "gif";

  return (
    <div
      className={cn(
        "group relative size-full overflow-hidden rounded-2xl border border-border bg-muted",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onRemove(media.id)}
        className={cn(
          "absolute right-3 top-3 z-30 flex size-8 items-center justify-center rounded-full bg-black/70 text-white transition-opacity duration-200",
          media.status === MEDIA_STATUS.UPLOADING ||
            media.status === MEDIA_STATUS.COMPRESSING
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100",
        )}
      >
        <X size={16} />
      </button>

      {isImage ? (
        <img
          src={media.previewUrl}
          alt={media.name}
          className="size-full object-cover"
        />
      ) : (
        <video
          src={media.previewUrl}
          controls
          className="size-full object-cover"
        />
      )}

      <TweetComposerMediaStatus
        status={media.status}
        progress={media.progress}
      />
    </div>
  );
}
