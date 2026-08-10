// /** @format */

export interface MediaAttachment {
  id: string;
  type: "image" | "video" | "gif" | "embed";
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  sizeInBytes?: number;
  mimeType?: string;
}

// export interface MediaAttachment {
//   id: string;
//   type: "image" | "video" | "gif" | "embed";
//   url: string;

//   fileName?: string;
//   contentType?: string;
//   sizeInBytes?: number;
//   sortOrder?: number;
// }
