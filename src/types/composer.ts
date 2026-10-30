import type { ComposerPoll } from "@/types/pollDraft";
import type { LinkPreview } from "@/types/linkPreview";
import type { Location } from "@/types/location";

import type { MEDIA_STATUS } from "@/constants/media";

import type { PollRequest } from "@/types/poll";

export type ComposerAction = "image" | "gif" | "video" | "emoji" | "poll" | "location" | "schedule";

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
  poll?: PollRequest | null;
  location?: Location | null;
  linkPreview?: LinkPreview | null;
}

export interface ComposerValues {
  content: string;
  media: ComposerMedia[];
  poll?: ComposerPoll | null;
  location?: Location | null;
  linkPreview?: LinkPreview | null;
  scheduledAt?: string | null;
}

export interface MediaKind {
  type: "image" | "video" | "gif";
}
