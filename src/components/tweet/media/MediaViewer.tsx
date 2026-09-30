import { useMediaZoom, useBodyScrollLock } from "@/hooks";
import { MEDIA_VIEWER } from "@/constants/media";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";

import type { MediaAttachment } from "@/types/media";

interface MediaViewerProps {
  attachments: MediaAttachment[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onChange: (index: number) => void;
}

export default function MediaViewer(props: MediaViewerProps) {
  const { open, currentIndex, attachments } = props;

  if (!open) return null;

  const attachment = attachments[currentIndex];
  if (!attachment) return null;

  return (
    <MediaViewerInner
      key={open ? `media-viewer-${attachment.url}` : "closed"}
      {...props}
    />
  );
}

function MediaViewerInner({
  attachments,
  currentIndex,
  open,
  onClose,
  onChange,
}: MediaViewerProps) {
  const attachment = attachments[currentIndex];

  const mediaZoom = useMediaZoom(open);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          onClose();
          break;

        case "ArrowLeft":
          if (currentIndex > 0) onChange(currentIndex - 1);
          break;

        case "ArrowRight":
          if (currentIndex < attachments.length - 1) onChange(currentIndex + 1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, onChange, currentIndex, attachments.length]);

  useBodyScrollLock(open);

  const handleBackdropClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (event.target === event.currentTarget) onClose();
  };

  const isVideo = attachment.type === "video";

  const mediaProps = {
    ref: mediaZoom.setMediaRef,
    src: attachment.url,
    className: "select-none object-contain",
    onPointerDown: mediaZoom.handlePointerDown,
    onPointerMove: mediaZoom.handlePointerMove,
    onPointerUp: mediaZoom.handlePointerUp,
    onPointerCancel: mediaZoom.handlePointerCancel,
  };
  const mediaStyle = {
    transition: mediaZoom.isPanning
      ? "none"
      : `transform ${MEDIA_VIEWER.TRANSITION_MS}ms ease`,
    touchAction: "none" as const,
  };

  return (
    <div
      className="fixed inset-0 z-media-viewer flex items-center justify-center bg-black/90"
      onClick={handleBackdropClick}
    >
      {/* Close */}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="fixed right-5 top-5 z-media-controls flex size-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-black/90"
        aria-label="Закрити"
      >
        <X size={20} />
      </button>

      {/* Previous */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onChange(currentIndex - 1);
          }}
          className="fixed left-5 top-1/2 z-media-controls flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-2xl text-white backdrop-blur transition hover:bg-black/90"
          aria-label="Попереднє вкладення"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Next */}
      {currentIndex < attachments.length - 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onChange(currentIndex + 1);
          }}
          className="fixed right-5 top-1/2 z-media-controls flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-2xl text-white backdrop-blur transition hover:bg-black/90"
          aria-label="Наступне вкладення"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Viewer */}
      <div
        className="relative max-h-[90vh] max-w-[90vw] items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`flex items-center justify-center ${
            mediaZoom.zoom > 1
              ? mediaZoom.isPanning
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-default"
          }`}
          onWheel={mediaZoom.handleWheel}
        >
          {isVideo ? (
            <video
              {...mediaProps}
              controls
              playsInline
              autoPlay
              preload="metadata"
              style={{
                ...mediaStyle,
                display: "block",
                width: "auto",
                height: "auto",
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
            />
          ) : (
            <img
              {...mediaProps}
              alt=""
              draggable={false}
              style={{
                ...mediaStyle,
                width: "min(70vw, 800px)",
                height: "min(70vh, 800px)",
              }}
            />
          )}
        </div>
      </div>

      {/* Zoom controls */}
      <div
        className="fixed bottom-5 left-1/2 z-media-controls flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/70 p-1 text-white backdrop-blur"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={mediaZoom.zoomOut}
          disabled={mediaZoom.zoom <= MEDIA_VIEWER.MIN_ZOOM}
          className="flex size-9 items-center justify-center rounded-full transition hover:bg-white/10 disabled:cursor-default disabled:opacity-40"
          aria-label="Зменшити"
        >
          <Minus size={18} />
        </button>

        <button
          type="button"
          onClick={mediaZoom.resetZoom}
          className="min-w-16 rounded-full px-3 py-2 text-sm font-medium transition hover:bg-white/10"
        >
          {Math.round(mediaZoom.zoom * 100)}%
        </button>

        <button
          type="button"
          onClick={mediaZoom.zoomIn}
          disabled={mediaZoom.zoom >= MEDIA_VIEWER.MAX_ZOOM}
          className="flex size-9 items-center justify-center rounded-full transition hover:bg-white/10 disabled:cursor-default disabled:opacity-40"
          aria-label="Збільшити"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
