/** @format */

import { BarChart3, Image, MapPin, Smile, Video } from "lucide-react";

import {
  ENABLE_GIFS,
  ENABLE_IMAGE_UPLOAD,
  ENABLE_LOCATION,
  ENABLE_POLLS,
  ENABLE_VIDEO_UPLOAD,
} from "@/constants/app";

import type { ComposerAction } from "@/types/composer";

interface TweetComposerToolbarProps {
  onAction: (action: ComposerAction) => void;
}

export default function TweetComposerToolbar({
  onAction,
}: TweetComposerToolbarProps) {
  const actions = [
    {
      id: "image" as const,
      enabled: ENABLE_IMAGE_UPLOAD,
      label: "Додати зображення",
      icon: <Image size={20} />,
    },
    {
      id: "gif" as const,
      enabled: ENABLE_GIFS,
      label: "GIF",
      icon: <span className="text-[11px] font-bold tracking-wide">GIF</span>,
    },
    {
      id: "video" as const,
      enabled: ENABLE_VIDEO_UPLOAD,
      label: "Додати відео",
      icon: <Video size={20} />,
    },
    {
      id: "emoji" as const,
      enabled: true,
      label: "Емодзі",
      icon: <Smile size={20} />,
    },
    {
      id: "poll" as const,
      enabled: ENABLE_POLLS,
      label: "Опитування",
      icon: <BarChart3 size={20} />,
    },
    {
      id: "location" as const,
      enabled: ENABLE_LOCATION,
      label: "Місце",
      icon: <MapPin size={20} />,
    },
  ];

  return (
    <div className="flex items-center gap-1">
      {actions
        .filter((action) => action.enabled)
        .map((action) => (
          <button
            key={action.id}
            type="button"
            aria-label={action.label}
            onClick={() => onAction(action.id)}
            className="flex size-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
          >
            {action.icon}
          </button>
        ))}
    </div>
  );
}
