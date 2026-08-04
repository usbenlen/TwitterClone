/** @format */

import { X } from "lucide-react";

import { cn } from "@/utils/cn";

import type { ComposerMedia } from "@/types/composer";

import TweetComposerMediaStatus from "@/components/tweet/TweetComposer/TweetComposerMediaStatus";

interface TweetComposerMediaPreviewProps {
  media: ComposerMedia[];
  onRemove: (id: string) => void;
}

export default function TweetComposerMediaPreview({
  media,
  onRemove,
}: TweetComposerMediaPreviewProps) {
  switch (media.length) {
    case 0:
      return null;

    case 1:
      return (
        <MediaItem media={media[0]} className="h-105" onRemove={onRemove} />
      );

    case 2:
      return (
        <div className="grid grid-cols-2 gap-2">
          {media.map((item) => (
            <MediaItem
              key={item.id}
              media={item}
              className="h-85"
              onRemove={onRemove}
            />
          ))}
        </div>
      );

    case 3:
      return (
        <div className="grid grid-cols-2 gap-2">
          <MediaItem media={media[0]} className="h-105" onRemove={onRemove} />

          <div className="grid gap-2">
            <MediaItem
              media={media[1]}
              className="h-51.5"
              onRemove={onRemove}
            />

            <MediaItem
              media={media[2]}
              className="h-51.5"
              onRemove={onRemove}
            />
          </div>
        </div>
      );

    default:
      return (
        <div className="grid grid-cols-2 gap-2">
          {media.slice(0, 4).map((item) => (
            <MediaItem
              key={item.id}
              media={item}
              className="h-52.5"
              onRemove={onRemove}
            />
          ))}
        </div>
      );
  }
}

interface MediaItemProps {
  media: ComposerMedia;
  className?: string;
  onRemove: (id: string) => void;
}

function MediaItem({ media, className, onRemove }: MediaItemProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-muted",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onRemove(media.id)}
        className={cn(
          "absolute right-3 top-3 z-30 flex size-8 items-center justify-center rounded-full bg-black/70 text-white transition-opacity duration-200",
          media.status === "uploading"
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100",
        )}
      >
        <X size={16} />
      </button>

      {media.type === "image" ? (
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
