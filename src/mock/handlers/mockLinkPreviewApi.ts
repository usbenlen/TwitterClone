import { createLinkPreviewPlaceholder, getDisplayDomain } from "@/features/content/lib/composer/linkPreview";
import { MOCK_DELAYS } from "@/mock/mockConfig";
import { delay } from "@/mock/utils/delay";

import type { LinkPreview } from "@/features/content/types";

function getYoutubeId(url: URL) {
  if (url.hostname === "youtu.be") return url.pathname.split("/")[1] || null;
  if (url.hostname.endsWith("youtube.com")) return url.searchParams.get("v");
  return null;
}

export const mockLinkPreviewApi = {
  async resolve(url: string, signal?: AbortSignal): Promise<LinkPreview> {
    await delay(MOCK_DELAYS.WRITE);
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      throw new Error("Unsupported URL.");

    const domain = getDisplayDomain(url);
    const youtubeId = getYoutubeId(parsed);

    return {
      id: crypto.randomUUID(),
      url,
      domain,
      title: youtubeId ? "YouTube video" : `Visit ${domain}`,
      imageUrl: youtubeId
        ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
        : createLinkPreviewPlaceholder(domain),
    };
  },
};
