import { useEffect, useRef, useState } from "react";

import type { MediaAttachment } from "@/types/media";

interface MediaItemProps {
  attachment: MediaAttachment;
  onOpen: () => void;
  openOnClick?: boolean;
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
}: MediaItemProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (attachment.type !== "video") return;

    const video = videoRef.current;
    if (!video) return;

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
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("durationchange", updateTime);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("durationchange", updateTime);
      video.removeEventListener("ended", handleEnded);
    };
  }, [attachment.type, attachment.url]);

  switch (attachment.type) {
    case "image":
    case "gif":
      return (
        <img
          src={attachment.url}
          alt=""
          draggable={false}
          onClick={openOnClick ? onOpen : undefined}
          className={`size-full select-none rounded-xl border border-border object-cover ${
            openOnClick ? "cursor-pointer" : ""
          }`}
        />
      );

    case "video":
      return (
        <div
          className={`relative size-full overflow-hidden rounded-xl border border-border ${
            openOnClick ? "cursor-pointer" : ""
          }`}
          onClick={openOnClick ? onOpen : undefined}
        >
          <video
            ref={videoRef}
            src={attachment.url}
            muted
            autoPlay={openOnClick}
            controls={!openOnClick}
            playsInline
            preload="metadata"
            className="size-full object-cover"
          />

          {openOnClick && (
            <div className="z-content absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur">
              {formatTime(remainingTime)}
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}
