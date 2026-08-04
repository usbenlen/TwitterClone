/** @format */

import { MEDIA_STATUS } from "@/constants/app";

export type ComposerAction =
  | "image"
  | "gif"
  | "video"
  | "emoji"
  | "poll"
  | "location";

export type ComposerMediaStatus =
  (typeof MEDIA_STATUS)[keyof typeof MEDIA_STATUS];

export interface ComposerMedia {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "video";
  name: string;
  size: number;
  status: ComposerMediaStatus;
  progress: number;
  attachmentId?: string;
}

export interface ComposerMediaError {
  id: string;
  message: string;
}
