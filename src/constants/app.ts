/** @format */

export const APP_NAME = import.meta.env.VITE_APP_NAME;

export const MAX_TWEET_LENGTH = Number(import.meta.env.VITE_MAX_TWEET_LENGTH);

export const MAX_MEDIA_ATTACHMENTS = Number(
  import.meta.env.VITE_MAX_MEDIA_ATTACHMENTS,
);

export const MAX_IMAGE_SIZE_MB = Number(import.meta.env.VITE_MAX_IMAGE_SIZE_MB);

export const MAX_VIDEO_SIZE_MB = Number(import.meta.env.VITE_MAX_VIDEO_SIZE_MB);

export const MAX_GIF_SIZE_MB = Number(import.meta.env.VITE_MAX_GIF_SIZE_MB);

export const MEDIA = {
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],

  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm"],
} as const;

export const ENABLE_IMAGE_UPLOAD =
  import.meta.env.VITE_ENABLE_IMAGE_UPLOAD === "true";

export const ENABLE_VIDEO_UPLOAD =
  import.meta.env.VITE_ENABLE_VIDEO_UPLOAD === "true";

export const ENABLE_GIFS = import.meta.env.VITE_ENABLE_GIFS === "true";

export const ENABLE_POLLS = import.meta.env.VITE_ENABLE_POLLS === "true";

export const ENABLE_LOCATION = import.meta.env.VITE_ENABLE_LOCATION === "true";
