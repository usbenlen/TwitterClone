import { MEDIA_STATUS } from "@/features/content/constants/media";

import type { ComposerMedia } from "@/features/content/types";

export function createPreview(
  file: File,
  type: ComposerMedia["type"],
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
