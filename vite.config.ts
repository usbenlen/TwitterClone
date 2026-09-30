import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  test: { environment: "node", clearMocks: true },
  plugins: [react(), tailwindcss(), svgr()],
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
});
