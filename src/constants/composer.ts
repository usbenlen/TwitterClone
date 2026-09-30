import { BarChart3, Image, MapPin, Smile, Video, Calendar } from "lucide-react";

import {
  ENABLE_GIFS,
  ENABLE_IMAGE_UPLOAD,
  ENABLE_LOCATION,
  ENABLE_POLLS,
  ENABLE_VIDEO_UPLOAD,
} from "@/constants/app";

export const COMPOSER_POPOVER = { OFFSET: 8, VIEWPORT_PADDING: 12 } as const;

export const COMPOSER_ACTIONS = [
  {
    id: "image" as const,
    enabled: ENABLE_IMAGE_UPLOAD,
    label: "Додати зображення",
    icon: Image,
  },
  {
    id: "gif" as const,
    enabled: ENABLE_GIFS,
    label: "GIF",
    icon: null,
  },
  {
    id: "video" as const,
    enabled: ENABLE_VIDEO_UPLOAD,
    label: "Додати відео",
    icon: Video,
  },
  {
    id: "poll" as const,
    enabled: ENABLE_POLLS,
    label: "Опитування",
    icon: BarChart3,
  },
  {
    id: "emoji" as const,
    enabled: true,
    label: "Емодзі",
    icon: Smile,
  },
  {
    id: "schedule" as const,
    enabled: true,
    label: "Запланувати",
    icon: Calendar,
  },
  {
    id: "location" as const,
    enabled: ENABLE_LOCATION,
    label: "Місце",
    icon: MapPin,
  },
] as const;
