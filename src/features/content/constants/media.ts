import { numericEnv } from "@/shared/constants/app";

export const MEDIA = {
  MAX_ATTACHMENTS: numericEnv.VITE_MAX_MEDIA_ATTACHMENTS,

  IMAGE: {
    MAX_SIZE_MB: numericEnv.VITE_MAX_IMAGE_SIZE_MB,
    MAX_WIDTH: numericEnv.VITE_IMAGE_MAX_WIDTH,
    QUALITY: numericEnv.VITE_IMAGE_QUALITY,

    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  },

  VIDEO: {
    MAX_SIZE_MB: numericEnv.VITE_MAX_VIDEO_SIZE_MB,

    ALLOWED_TYPES: ["video/mp4", "video/webm"],
  },

  GIF: {
    MAX_SIZE_MB: numericEnv.VITE_MAX_GIF_SIZE_MB,
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

// The grid has four visible cells, independently of the upload limit
export const MEDIA_GRID_VISIBLE_LIMIT = 4;
export const MEDIA_UPLOAD_SUCCESS_VISIBLE_MS = 800;
export const BYTES_PER_MEGABYTE = 1024 ** 2;
export const MEDIA_VIEWER = {
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 4,
  ZOOM_STEP: 0.25,
  PAN_PADDING: 80,
  TRANSITION_MS: 200,
} as const;
