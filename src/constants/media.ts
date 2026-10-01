// The grid has four visible cells, independently of the upload limit.
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
