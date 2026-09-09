import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";

import type { MediaAttachment } from "@/types/media";

interface MediaViewerProps {
  attachments: MediaAttachment[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onChange: (index: number) => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
const PAN_PADDING = 80;

interface PanPosition {
  x: number;
  y: number;
}

interface DragState {
  active: boolean;
  startX: number;
  startY: number;
  startPanX: number;
  startPanY: number;
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

  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const panRef = useRef<PanPosition>({ x: 0, y: 0 });

  const dragRef = useRef<DragState>({
    active: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });

  const frameRef = useRef<number | null>(null);

  const setMediaRef = (node: HTMLImageElement | HTMLVideoElement | null) => {
    mediaRef.current = node;
  };

  const cancelAnimationFrameIfNeeded = () => {
    if (frameRef.current === null) return;

    cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  };

  const applyTransform = (x: number, y: number, scale: number) => {
    if (!mediaRef.current) return;
    mediaRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  };

  const resetPan = () => {
    panRef.current = { x: 0, y: 0 };

    cancelAnimationFrameIfNeeded();

    applyTransform(0, 0, 1);
  };

  const clampPan = (x: number, y: number): PanPosition => {
    const media = mediaRef.current;
    if (!media) return { x, y };

    const container = media.parentElement;
    if (!container) return { x, y };

    const maxX =
      Math.max(0, (media.offsetWidth * zoom - container.clientWidth) / 2) +
      PAN_PADDING;

    const maxY =
      Math.max(0, (media.offsetHeight * zoom - container.clientHeight) / 2) +
      PAN_PADDING;

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  const updatePan = (x: number, y: number) => {
    const clamped = clampPan(x, y);
    panRef.current = clamped;

    cancelAnimationFrameIfNeeded();

    frameRef.current = requestAnimationFrame(() => {
      applyTransform(clamped.x, clamped.y, zoom);
      frameRef.current = null;
    });
  };

  useEffect(() => {
    if (!open || !mediaRef.current) return;

    const clamped = clampPan(panRef.current.x, panRef.current.y);
    panRef.current = clamped;

    applyTransform(clamped.x, clamped.y, zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, open]);

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

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    return () => {
      cancelAnimationFrameIfNeeded();
    };
  }, []);

  if (!open || !attachment) return null;

  const zoomIn = () => {
    setZoom((current) =>
      Math.min(MAX_ZOOM, Number((current + ZOOM_STEP).toFixed(2))),
    );
  };

  const zoomOut = () => {
    setZoom((current) => {
      const nextZoom = Math.max(
        MIN_ZOOM,
        Number((current - ZOOM_STEP).toFixed(2)),
      );

      if (nextZoom === 1) resetPan();

      return nextZoom;
    });
  };

  const resetZoom = () => {
    resetPan();
    setZoom(1);
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();

    if (event.deltaY < 0) zoomIn();
    else zoomOut();
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (zoom <= 1) return;

    event.preventDefault();

    setIsPanning(true);

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      startPanX: panRef.current.x,
      startPanY: panRef.current.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!dragRef.current.active) return;

    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;

    updatePan(
      dragRef.current.startPanX + deltaX,
      dragRef.current.startPanY + deltaY,
    );
  };

  const stopPanning = () => {
    dragRef.current.active = false;
    setIsPanning(false);
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    if (!dragRef.current.active) return;

    stopPanning();

    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handlePointerCancel = () => {
    stopPanning();
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (event.target === event.currentTarget) onClose();
  };

  const isVideo = attachment.type === "video";

  const mediaClassName = "select-none object-contain";
  const mediaStyle = {
    // eslint-disable-next-line react-hooks/refs
    transition: dragRef.current.active ? "none" : "transform 200ms ease",
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
            zoom > 1
              ? isPanning
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-default"
          }`}
          onWheel={handleWheel}
        >
          {isVideo ? (
            <video
              ref={setMediaRef}
              src={attachment.url}
              controls
              playsInline
              autoPlay
              preload="metadata"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              className={mediaClassName}
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
              ref={setMediaRef}
              src={attachment.url}
              alt=""
              draggable={false}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              className={mediaClassName}
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
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="flex size-9 items-center justify-center rounded-full transition hover:bg-white/10 disabled:cursor-default disabled:opacity-40"
          aria-label="Зменшити"
        >
          <Minus size={18} />
        </button>

        <button
          type="button"
          onClick={resetZoom}
          className="min-w-16 rounded-full px-3 py-2 text-sm font-medium transition hover:bg-white/10"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          type="button"
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="flex size-9 items-center justify-center rounded-full transition hover:bg-white/10 disabled:cursor-default disabled:opacity-40"
          aria-label="Збільшити"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
