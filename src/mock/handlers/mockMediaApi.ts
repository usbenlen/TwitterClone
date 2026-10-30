import { mediaStore } from "@/mock/stores/mediaStore";
import { mockUpload } from "@/mock/utils/mockUpload";

import type { MediaAttachment } from "@/features/content/types";

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
      type:
        file.type === "image/gif"
          ? "gif"
          : file.type.startsWith("image/")
            ? "image"
            : "video",
      url: URL.createObjectURL(file),
      sizeInBytes: file.size,
      mimeType: file.type,
    };

    return mediaStore.add(attachment);
  },
};
