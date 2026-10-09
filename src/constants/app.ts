import { readAppIdentity, readNumericEnv } from "@/config/env";

const identity = readAppIdentity(import.meta.env);
const numeric = readNumericEnv(import.meta.env);
export const APP_NAME = identity.name;
export const APP_LOCALE = identity.locale;

export const MAX_TWEET_LENGTH = numeric.VITE_MAX_TWEET_LENGTH;
export const MAX_NAME_LENGTH = numeric.VITE_MAX_NAME_LENGTH;
export const MAX_BIO_LENGTH = numeric.VITE_MAX_BIO_LENGTH;

export const SEARCH_DEBOUNCE_MS = 350;
export const LOCATION_SEARCH_DEBOUNCE_MS = 200;

export const AUTH_LIMITS = {
  VERIFICATION_CODE_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 64,
} as const;

export const MEDIA = {
  MAX_ATTACHMENTS: numeric.VITE_MAX_MEDIA_ATTACHMENTS,

  IMAGE: {
    MAX_SIZE_MB: numeric.VITE_MAX_IMAGE_SIZE_MB,
    MAX_WIDTH: numeric.VITE_IMAGE_MAX_WIDTH,
    QUALITY: numeric.VITE_IMAGE_QUALITY,

    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  },

  VIDEO: {
    MAX_SIZE_MB: numeric.VITE_MAX_VIDEO_SIZE_MB,

    ALLOWED_TYPES: ["video/mp4", "video/webm"],
  },

  GIF: {
    MAX_SIZE_MB: numeric.VITE_MAX_GIF_SIZE_MB,
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

export const ENABLE_LINK_PREVIEWS =
  import.meta.env.VITE_ENABLE_LINK_PREVIEWS === "true";
export const ENABLE_GIFS = import.meta.env.VITE_ENABLE_GIFS === "true";
export const ENABLE_POLLS = import.meta.env.VITE_ENABLE_POLLS === "true";
export const ENABLE_LOCATION = import.meta.env.VITE_ENABLE_LOCATION === "true";
