import { MEDIA_STATUS } from "@/constants/app";
import type { Location } from "@/types/location";
import type { LinkPreview } from "@/types/linkPreview";

export type ComposerAction =
  | "image"
  | "gif"
  | "video"
  | "emoji"
  | "poll"
  | "location"
  | "schedule";

export type ComposerMediaStatus =
  (typeof MEDIA_STATUS)[keyof typeof MEDIA_STATUS];

export interface ComposerMedia {
  id: string;
  file?: File;
  previewUrl: string;
  attachmentId?: string;
  url?: string;
  type: "image" | "video" | "gif";
  name: string;
  size: number;
  width?: number;
  height?: number;
  status: ComposerMediaStatus;
  progress: number;
}

export interface ComposerMediaError {
  id: string;
  message: string;
}

export interface ComposerSubmitData {
  content: string;
  mediaIds: string[];
  poll?: {
    options: string[];
    duration: number;
  } | null;
  location?: Location | null;
  linkPreview?: LinkPreview | null;
}
