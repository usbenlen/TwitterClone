/** @format */

import { MEDIA_STATUS } from "@/constants/app";

export type ComposerAction =
  | "image"
  | "gif"
  | "video"
  | "emoji"
  | "poll"
  | "location"
  | "embed";

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
