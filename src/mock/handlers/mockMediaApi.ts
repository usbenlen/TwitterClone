/** @format */

import { mockUpload } from "@/mock/utils/mockUpload";
import type { MediaAttachment } from "@/types/media";

interface UploadMediaOptions {
  onProgress?: (progress: number) => void;
}

export const mockMediaApi = {
  async upload(
    file: File,
    options?: UploadMediaOptions,
  ): Promise<MediaAttachment> {
    await mockUpload(file, {
      onProgress: options?.onProgress,
    });

    return {
      id: crypto.randomUUID(),
      type: file.type.startsWith("image/") ? "image" : "video",
      url: URL.createObjectURL(file),
      size: file.size,
      mimeType: file.type,
    };
  },
};
