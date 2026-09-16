import type { LinkPreview } from "@/types/linkPreview";
import type { MediaAttachment } from "@/types/media";

export interface ScheduledMediaInput {
  attachmentId: string;
  file: File;
  type: MediaAttachment["type"];
}

export interface CreateScheduledPostRequest {
  content: string;
  mediaIds: string[];
  linkPreview?: LinkPreview | null;
  scheduledAt: string;
  /** Використовується тільки моком. Коли не мок це поле не використовується. */
  mockMedia?: ScheduledMediaInput[];
}

export type UpdateScheduledPostRequest = CreateScheduledPostRequest;

export interface ScheduledPost {
  id: string;
  content: string;
  mediaIds: string[];
  media: MediaAttachment[];
  linkPreview?: LinkPreview | null;
  scheduledAt: string;
  createdAt: string;
}
