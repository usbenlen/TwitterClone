export interface MediaAttachment {
  id: string;
  type: "image" | "video" | "gif";
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  sizeInBytes?: number;
  mimeType?: string;
}

export type MediaValidationResult =
  | {
      valid: true;
      type: "image" | "video" | "gif";
    }
  | {
      valid: false;
      message: string;
    };
