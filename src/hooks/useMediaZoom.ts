import { useCallback, useEffect, useRef, useState } from "react";
import { MEDIA_VIEWER } from "@/constants/media";

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

export function useMediaZoom(open: boolean) {
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

  const cancelAnimationFrameIfNeeded = useCallback(() => {
    if (frameRef.current === null) return;

    cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  const applyTransform = useCallback((x: number, y: number, scale: number) => {
    if (!mediaRef.current) return;
    mediaRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);

  const resetPan = () => {
    panRef.current = { x: 0, y: 0 };

    cancelAnimationFrameIfNeeded();

    applyTransform(0, 0, 1);
  };

  const clampPan = useCallback(
    (x: number, y: number): PanPosition => {
      const media = mediaRef.current;
      if (!media) return { x, y };

      const container = media.parentElement;
      if (!container) return { x, y };

      const maxX =
        Math.max(0, (media.offsetWidth * zoom - container.clientWidth) / 2) +
        MEDIA_VIEWER.PAN_PADDING;

      const maxY =
        Math.max(0, (media.offsetHeight * zoom - container.clientHeight) / 2) +
        MEDIA_VIEWER.PAN_PADDING;

      return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
      };
    },
    [zoom],
  );

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
  }, [zoom, open, clampPan, applyTransform]);

  useEffect(() => {
    return () => {
      cancelAnimationFrameIfNeeded();
    };
  }, [cancelAnimationFrameIfNeeded]);

  const zoomIn = () => {
    setZoom((current) =>
      Math.min(
        MEDIA_VIEWER.MAX_ZOOM,
        Number((current + MEDIA_VIEWER.ZOOM_STEP).toFixed(2)),
      ),
    );
  };

  const zoomOut = () => {
    setZoom((current) => {
      const nextZoom = Math.max(
        MEDIA_VIEWER.MIN_ZOOM,
        Number((current - MEDIA_VIEWER.ZOOM_STEP).toFixed(2)),
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

  return {
    zoom,
    isPanning,
    setMediaRef,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
}
