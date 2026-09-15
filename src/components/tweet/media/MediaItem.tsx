import { useEffect, useRef, useState } from "react";

import type { MediaAttachment } from "@/types/media";
import { cn } from "@/utils/cn";

interface MediaItemProps {
  attachment: MediaAttachment;
  onOpen: () => void;
  openOnClick?: boolean;
  autoPlayInline?: boolean;
  flush?: boolean;
}

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const totalSeconds = Math.ceil(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export default function MediaItem({
  attachment,
  onOpen,
  openOnClick = true,
  autoPlayInline = false,
  flush = false,
}: MediaItemProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [touchControlsOpen, setTouchControlsOpen] = useState(false);

  const isAutoPlaying = autoPlayInline || openOnClick;
  const controlsVisible = !isAutoPlaying || showControls;

  useEffect(() => {
    if (!touchControlsOpen) return;

    const hideControlsOutside = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;

      setShowControls(false);
      setTouchControlsOpen(false);
    };

    document.addEventListener("pointerdown", hideControlsOutside, true);

    return () => {
      document.removeEventListener("pointerdown", hideControlsOutside, true);
    };
  }, [touchControlsOpen]);

  useEffect(() => {
    if (attachment.type !== "video") return;

    const video = videoRef.current;
    if (!video) return;

    const tryAutoPlay = () => {
      if (!isAutoPlaying) return;

      video.muted = true;
      video.defaultMuted = true;
      void video.play().catch(() => {
      });
    };

    const handleEnded = () => {
      video.currentTime = 0;
      video.pause();

      if (Number.isFinite(video.duration)) setRemainingTime(video.duration);
    };

    const updateTime = () => {
      setRemainingTime(Math.max(0, video.duration - video.currentTime));
    };

    const handleLoadedMetadata = () => {
      if (Number.isFinite(video.duration)) setRemainingTime(video.duration);
      tryAutoPlay();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", tryAutoPlay);
    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("durationchange", updateTime);
    video.addEventListener("ended", handleEnded);

    tryAutoPlay();

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", tryAutoPlay);
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("durationchange", updateTime);
      video.removeEventListener("ended", handleEnded);
    };
  }, [attachment.type, attachment.url, isAutoPlaying]);

  switch (attachment.type) {
    case "image":
    case "gif":
      return (
        <img
          src={attachment.url}
          alt=""
          draggable={false}
          onClick={openOnClick ? onOpen : undefined}
          className={cn(
            "size-full select-none object-cover",
            !flush && "rounded-xl border border-border",
            openOnClick && "cursor-pointer",
          )}
        />
      );

    case "video":
      return (
        <div
          ref={containerRef}
          className={cn(
            "relative size-full overflow-hidden",
            !flush && "rounded-xl border border-border",
          )}
          onPointerMove={(event) => {
            if (isAutoPlaying && event.pointerType === "mouse")
              setShowControls(true);
          }}
          onPointerLeave={(event) => {
            if (isAutoPlaying && event.pointerType === "mouse")
              setShowControls(false);
          }}
          onPointerDown={(event) => {
            if (!isAutoPlaying || event.pointerType === "mouse") return;

            if (!showControls) event.preventDefault();
            setShowControls(true);
            setTouchControlsOpen(true);
          }}
          onFocusCapture={() => {
            if (isAutoPlaying) setShowControls(true);
          }}
          onBlurCapture={(event) => {
            if (event.currentTarget.contains(event.relatedTarget)) return;

            setShowControls(false);
            setTouchControlsOpen(false);
          }}
        >
          <video
            ref={videoRef}
            src={attachment.url}
            muted
            autoPlay={isAutoPlaying}
            controls={controlsVisible}
            playsInline
            preload="metadata"
            tabIndex={0}
            aria-label="Відео"
            className="size-full object-cover"
          />

          {isAutoPlaying && !showControls && (
            <div className="pointer-events-none absolute bottom-2 right-2 z-content rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur">
              {formatTime(remainingTime)}
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}
