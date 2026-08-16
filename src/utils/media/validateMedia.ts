import { MEDIA } from "@/constants/app";

export type MediaValidationResult =
  | {
      valid: true;
      type: "image" | "video";
    }
  | {
      valid: false;
      message: string;
    };

export function validateMedia(file: File): MediaValidationResult {
  const isImage = MEDIA.IMAGE.ALLOWED_TYPES.includes(file.type);
  const isVideo = MEDIA.VIDEO.ALLOWED_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      message: `"${file.name}" має непідтримуваний формат файлу.`,
    };
  }

  const maxSize = isImage
    ? MEDIA.IMAGE.MAX_SIZE_MB * 1024 * 1024
    : MEDIA.VIDEO.MAX_SIZE_MB * 1024 * 1024;

  if (file.size > maxSize) {
    return {
      valid: false,
      message: `"${file.name}" перевищує максимально допустимий розмір (${isImage ? MEDIA.IMAGE.MAX_SIZE_MB : MEDIA.VIDEO.MAX_SIZE_MB} MB).`,
    };
  }

  return {
    valid: true,
    type: isImage ? "image" : "video",
  };
}
