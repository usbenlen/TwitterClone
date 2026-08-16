import { compressImage, createPreview, validateMedia } from "@/utils/media";

import type { ComposerMedia } from "@/types/composer";

type PrepareMediaResult =
  | {
      success: true;
      media: ComposerMedia;
    }
  | {
      success: false;
      message: string;
    };

export async function prepareMedia(file: File): Promise<PrepareMediaResult> {
  const validation = validateMedia(file);

  if (!validation.valid) {
    return {
      success: false,
      message: validation.message,
    };
  }

  const processedFile =
    validation.type === "image" ? await compressImage(file) : file;

  return {
    success: true,
    media: createPreview(processedFile, validation.type),
  };
}
