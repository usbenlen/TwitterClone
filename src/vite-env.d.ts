/** @format */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PATH_TO_SERVER: string;
  readonly VITE_PATH_TO_API: string;
  readonly VITE_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.svg?react" {
  import * as React from "react";
  const Component: React.FC<React.SVGProps<SVGSVGElement>>;
  export default Component;
}
