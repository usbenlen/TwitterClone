import { compressImage } from "@/features/content/lib/media/compressImage";
import { createPreview } from "@/features/content/lib/media/createPreview";
import { validateMedia } from "@/features/content/lib/media/validateMedia";

import type { ComposerMedia } from "@/features/content/types";

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

  const processedFile = validation.type === "image" ? await compressImage(file) : file;

  return {
    success: true,
    media: createPreview(processedFile, validation.type),
  };
}
