/** @format */

export const APP_NAME = import.meta.env.VITE_APP_NAME;

export const MAX_TWEET_LENGTH = Number(import.meta.env.VITE_MAX_TWEET_LENGTH);
export const MAX_NAME_LENGTH = Number(import.meta.env.VITE_MAX_NAME_LENGTH);
export const MAX_BIO_LENGTH = Number(import.meta.env.VITE_MAX_BIO_LENGTH);

export const MEDIA = {
  MAX_ATTACHMENTS: Number(import.meta.env.VITE_MAX_MEDIA_ATTACHMENTS),

  IMAGE: {
    MAX_SIZE_MB: Number(import.meta.env.VITE_MAX_IMAGE_SIZE_MB),
    MAX_WIDTH: Number(import.meta.env.VITE_IMAGE_MAX_WIDTH),
    QUALITY: Number(import.meta.env.VITE_IMAGE_QUALITY),

    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  },

  VIDEO: {
    MAX_SIZE_MB: Number(import.meta.env.VITE_MAX_VIDEO_SIZE_MB),

    ALLOWED_TYPES: ["video/mp4", "video/webm"],
  },

  GIF: {
    MAX_SIZE_MB: Number(import.meta.env.VITE_MAX_GIF_SIZE_MB),
  },
};

export const MEDIA_STATUS = {
  IDLE: "idle",
  COMPRESSING: "compressing",
  READY: "ready",
  UPLOADING: "uploading",
  UPLOADED: "uploaded",
  ERROR: "error",
} as const;

export const ENABLE_IMAGE_UPLOAD =
  import.meta.env.VITE_ENABLE_IMAGE_UPLOAD === "true";
export const ENABLE_VIDEO_UPLOAD =
  import.meta.env.VITE_ENABLE_VIDEO_UPLOAD === "true";
export const ENABLE_EMBED = import.meta.env.VITE_ENABLE_EMBED === "true";
export const ENABLE_GIFS = import.meta.env.VITE_ENABLE_GIFS === "true";
export const ENABLE_POLLS = import.meta.env.VITE_ENABLE_POLLS === "true";
export const ENABLE_LOCATION = import.meta.env.VITE_ENABLE_LOCATION === "true";
