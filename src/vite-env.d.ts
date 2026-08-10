/** @format */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;

  readonly VITE_PATH_TO_SERVER: string;
  readonly VITE_PATH_TO_API: string;

  readonly VITE_USE_MOCK?: string;

  readonly VITE_MAX_NAME_LENGTH: string;
  readonly VITE_MAX_BIO_LENGTH: string;

  readonly VITE_MAX_TWEET_LENGTH: string;
  readonly VITE_MAX_MEDIA_ATTACHMENTS: string;

  readonly VITE_MAX_IMAGE_SIZE_MB: string;
  readonly VITE_MAX_VIDEO_SIZE_MB: string;
  readonly VITE_MAX_GIF_SIZE_MB: string;

  readonly VITE_IMAGE_MAX_WIDTH: string;
  readonly VITE_IMAGE_QUALITY: string;

  readonly VITE_ENABLE_IMAGE_UPLOAD: string;
  readonly VITE_ENABLE_VIDEO_UPLOAD: string;
  readonly VITE_ENABLE_EMBED: string;
  readonly VITE_ENABLE_GIFS: string;
  readonly VITE_ENABLE_POLLS: string;
  readonly VITE_ENABLE_LOCATION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.svg?react" {
  import * as React from "react";
  const Component: React.FC<React.SVGProps<SVGSVGElement>>;
  export default Component;
}
