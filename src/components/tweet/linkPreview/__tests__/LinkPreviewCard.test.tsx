// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";

import LinkPreviewCard from "@/components/tweet/linkPreview/LinkPreviewCard";
import type { LinkPreview } from "@/types/linkPreview";

const preview: LinkPreview = {
  id: "react",
  url: "https://react.dev/",
  domain: "react.dev",
  title: "React documentation",
  imageUrl: null,
};

it.each([null, " ", "https://react.dev/preview.png"])(
  "uses the domain template when image %s is unavailable",
  async (imageUrl) => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const host = document.createElement("div");
    const root = createRoot(host);
    const image = () => host.querySelector("img")!;
    try {
      await act(async () => root.render(<LinkPreviewCard preview={{ ...preview, imageUrl }} />));
      const frame = image().parentElement;

      if (imageUrl?.trim()) {
        expect(image().getAttribute("src")).toBe(imageUrl);
        await act(async () => image().dispatchEvent(new Event("error")));
      }

      const [type, template] = image().getAttribute("src")!.split(",", 2);
      expect(type).toBe("data:image/svg+xml;charset=UTF-8");
      expect(decodeURIComponent(template)).toContain(">react.dev</text>");
      expect(image().parentElement).toBe(frame);
      expect(host.querySelector("a")?.getAttribute("href")).toBe(preview.url);
      expect(host.textContent).toContain(preview.title);

      const nextImage = "https://react.dev/new.png";
      await act(async () => root.render(<LinkPreviewCard preview={{ ...preview, imageUrl: nextImage }} />));
      expect(image().getAttribute("src")).toBe(nextImage);
    } finally {
      await act(async () => root.unmount());
      vi.unstubAllGlobals();
    }
  },
);
