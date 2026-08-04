/** @format */

import { MEDIA_STATUS } from "@/constants/app";
import type { ComposerMedia } from "@/types/composer";

export function createPreview(
  file: File,
  type: "image" | "video",
): ComposerMedia {
  return {
    id: crypto.randomUUID(),
    file,
    previewUrl: URL.createObjectURL(file),

    type,

    name: file.name,
    size: file.size,

    status: MEDIA_STATUS.READY,
    progress: 0,
  };
}
