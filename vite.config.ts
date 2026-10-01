import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import { loadEnv } from "vite";
import {
  escapeHtml,
  readAppIdentity,
  readNumericEnv,
} from "./src/config/env.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  readNumericEnv(env);
  const identity = readAppIdentity(env);
  return {
    test: { environment: "node", clearMocks: true },
    plugins: [
      react(),
      tailwindcss(),
      svgr(),
      {
        name: "app-identity",
        transformIndexHtml: (html: string) =>
          html
            .replaceAll("__APP_NAME__", escapeHtml(identity.name))
            .replaceAll("__APP_LOCALE__", escapeHtml(identity.locale)),
      },
    ],
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-router",
        "react-redux",
        "@reduxjs/toolkit",
        "@reduxjs/toolkit/query/react",
        "react-hook-form",
        "@hookform/resolvers/zod",
      ],
    },
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
