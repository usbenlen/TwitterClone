import { BYTES_PER_MEGABYTE, MEDIA } from "@/constants";

export type MediaValidationResult =
  | {
      valid: true;
      type: "image" | "video" | "gif";
    }
  | {
      valid: false;
      message: string;
    };

export function validateMedia(file: File): MediaValidationResult {
  const isImage = MEDIA.IMAGE.ALLOWED_TYPES.includes(file.type);
  const isVideo = MEDIA.VIDEO.ALLOWED_TYPES.includes(file.type);
  const isGif = file.type === "image/gif";

  if (!isImage && !isVideo && !isGif) {
    return {
      valid: false,
      message: `"${file.name}" має непідтримуваний формат файлу.`,
    };
  }

  const maxSizeMb = isGif
    ? MEDIA.GIF.MAX_SIZE_MB
    : isImage
      ? MEDIA.IMAGE.MAX_SIZE_MB
      : MEDIA.VIDEO.MAX_SIZE_MB;
  const maxSize = maxSizeMb * BYTES_PER_MEGABYTE;

  if (file.size > maxSize) {
    return {
      valid: false,
      message: `"${file.name}" перевищує максимально допустимий розмір (${maxSizeMb} MB).`,
    };
  }

  return {
    valid: true,
    type: isGif ? "gif" : isImage ? "image" : "video",
  };
}
