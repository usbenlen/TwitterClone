import { useState } from "react";
import { ExternalLink, X } from "lucide-react";

import { cn } from "@/utils/cn";

import type { LinkPreview } from "@/types/linkPreview";

interface LinkPreviewCardProps {
  preview: LinkPreview;
  onRemove?: () => void;
  className?: string;
  compact?: boolean;
}

export default function LinkPreviewCard({
  preview,
  onRemove,
  className,
  compact = false,
}: LinkPreviewCardProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage = Boolean(
    preview.imageUrl && preview.imageUrl !== failedImageUrl,
  );

  return (
    <div className={cn("relative mt-3", className)}>
      <a
        href={preview.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Відкрити ${preview.title} на ${preview.domain}`}
        className="group block overflow-hidden rounded-2xl border border-border bg-card outline-none transition hover:border-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary"
      >
        {showImage ? (
          <div className="relative aspect-video overflow-hidden bg-muted">
            <img
              src={preview.imageUrl!}
              alt=""
              className="size-full object-cover transition duration-300 group-hover:scale-[1.01]"
              onError={() => setFailedImageUrl(preview.imageUrl)}
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/65 to-transparent px-3 pb-3 pt-12 text-white sm:px-4 sm:pb-4">
              <div className="mb-1 text-xs font-semibold tracking-wide text-white/80">
                {preview.domain}
              </div>
              <div
                className={cn(
                  "line-clamp-2 font-semibold leading-snug",
                  compact ? "text-sm" : "text-[15px] sm:text-base",
                )}
              >
                {preview.title}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-24 items-center gap-3 p-4 pr-12">
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-muted-foreground">
                {preview.domain}
              </div>
              <div className="mt-1 line-clamp-2 font-semibold leading-snug">
                {preview.title}
              </div>
            </div>
            <ExternalLink
              className="size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        )}
      </a>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Видалити прев’ю посилання"
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-white shadow-sm transition hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
