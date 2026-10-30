import { ImagePlus, LoaderCircle, RotateCw, X } from "lucide-react";
import { useRef } from "react";

import { MEDIA } from "@/features/content/constants/media";
import { ENABLE_IMAGE_UPLOAD } from "@/shared/config/featureFlags";

import type { ComposerMedia } from "@/features/content/types";

interface PollOptionImageProps {
  index: number;
  image?: ComposerMedia;
  disabled: boolean;
  onSelect?: (file: File) => void;
  onRemove?: () => void;
  onRetry?: () => void;
}

export default function PollOptionImage({
  index,
  image,
  disabled,
  onSelect,
  onRemove,
  onRetry,
}: PollOptionImageProps) {
  const input = useRef<HTMLInputElement>(null);

  if (!ENABLE_IMAGE_UPLOAD && !image) return null;

  const busy = image && image.status !== "uploaded" && image.status !== "error";

  return (
    <div className="relative shrink-0 self-start">
      <input
        ref={input}
        type="file"
        accept={MEDIA.IMAGE.ALLOWED_TYPES.join(",")}
        hidden
        disabled={disabled || !ENABLE_IMAGE_UPLOAD}
        aria-label={`Фото для варіанта ${index + 1}`}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onSelect?.(file);
        }}
      />
      <button
        type="button"
        disabled={disabled || !ENABLE_IMAGE_UPLOAD}
        onClick={() => input.current?.click()}
        aria-label={`${image ? "Замінити" : "Додати"} фото для варіанта ${index + 1}`}
        className="relative flex size-14 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-muted focus-visible:focus-indicator disabled:opacity-50"
      >
        {image ? (
          <img
            src={image.previewUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <ImagePlus size={20} aria-hidden="true" />
        )}
        {busy && (
          <span
            role="status"
            className="absolute inset-0 flex items-center justify-center bg-background/70"
          >
            <LoaderCircle
              size={20}
              className="animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">
              Завантаження фото: {Math.round(image.progress)}%
            </span>
          </span>
        )}
      </button>
      {image && (
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          aria-label={`Видалити фото варіанта ${index + 1}`}
          className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted focus-visible:focus-indicator disabled:opacity-50"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
      {image?.status === "error" && ENABLE_IMAGE_UPLOAD && (
        <button
          type="button"
          disabled={disabled}
          onClick={onRetry}
          aria-label={`Повторити завантаження фото варіанта ${index + 1}`}
          className="mt-1 flex min-h-8 w-full items-center justify-center rounded-md text-primary hover:bg-primary/10 focus-visible:focus-indicator disabled:opacity-50"
        >
          <RotateCw size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
