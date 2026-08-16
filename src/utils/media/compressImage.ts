import imageCompression from "browser-image-compression";

import { MEDIA } from "@/constants/app";

interface CompressImageOptions {
  maxSizeMB?: number;
  maxWidth?: number;
  quality?: number;
  fileType?: string;
}

export async function compressImage(
  file: File,
  options?: CompressImageOptions,
): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: options?.maxSizeMB ?? MEDIA.IMAGE.MAX_SIZE_MB,
    maxWidthOrHeight: options?.maxWidth ?? MEDIA.IMAGE.MAX_WIDTH,
    initialQuality: options?.quality ?? MEDIA.IMAGE.QUALITY,
    fileType: options?.fileType ?? "image/webp",
    useWebWorker: true,
  });
}
