/** @format */

export interface MediaAttachment {
  id: string;
  type: "image" | "video" | "gif" | "embed";
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
  mimeType?: string;
}
