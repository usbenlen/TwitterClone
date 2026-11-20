import { useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/utils/cn";
import { createLinkPreviewPlaceholder } from "@/utils/linkPreview";

import type { LinkPreview } from "@/types/linkPreview";

interface LinkPreviewCardProps {
  preview: LinkPreview;
  onRemove?: () => void;
  className?: string;
  compact?: boolean;
  disabled?: boolean;
}

export default function LinkPreviewCard({
  preview,
  onRemove,
  className,
  compact = false,
  disabled = false,
}: LinkPreviewCardProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = preview.imageUrl?.trim();
  const remoteImage = imageUrl && imageUrl !== failedImageUrl ? imageUrl : null;
  const source = remoteImage ?? createLinkPreviewPlaceholder(preview.domain);

  return (
    <div className={cn("relative mt-3", className)}>
      <a
        href={preview.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Відкрити ${preview.title} на ${preview.domain}`}
        className="group block overflow-hidden rounded-2xl border border-border bg-card outline-none transition hover:border-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            key={source}
            src={source}
            alt=""
            className="size-full object-cover transition duration-300 group-hover:scale-[1.01]"
            onError={remoteImage ? () => setFailedImageUrl(remoteImage) : undefined}
          />

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/65 to-transparent px-3 pb-3 pt-12 text-white sm:px-4 sm:pb-4">
            <div className="mb-1 truncate text-xs font-semibold tracking-wide text-white/80">
              {preview.domain}
            </div>
            <div
              className={cn(
                "line-clamp-2 wrap-anywhere font-semibold leading-snug",
                compact ? "text-sm" : "text-[15px] sm:text-base",
              )}
            >
              {preview.title}
            </div>
          </div>
        </div>
      </a>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Видалити прев’ю посилання"
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-white shadow-sm transition hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50"
        >
          <X size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
