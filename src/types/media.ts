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
