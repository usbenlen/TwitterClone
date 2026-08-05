/** @format */

import type { MediaAttachment } from "@/types/media";

import { mockUpload } from "@/mock/utils/mockUpload";
import { mediaStore } from "@/mock/stores/mediaStore";

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

    const attachment: MediaAttachment = {
      id: crypto.randomUUID(),
      type: file.type.startsWith("image/") ? "image" : "video",
      url: URL.createObjectURL(file),
      size: file.size,
      mimeType: file.type,
    };

    return mediaStore.add(attachment);
  },
};
