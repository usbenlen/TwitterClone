import type { LinkPreview } from "@/types/linkPreview";

import { delay } from "@/mock/utils/delay";
import { getDisplayDomain } from "@/utils/linkPreview";

function getYoutubeId(url: URL) {
  if (url.hostname === "youtu.be") return url.pathname.split("/")[1] || null;
  if (url.hostname.endsWith("youtube.com")) return url.searchParams.get("v");
  return null;
}

function createPlaceholderImage(domain: string) {
  const safeDomain = domain.replace(/[<>&"']/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1d9bf0"/><stop offset="1" stop-color="#7856ff"/></linearGradient></defs><rect width="1200" height="675" fill="url(#g)"/><circle cx="1030" cy="100" r="260" fill="white" opacity=".08"/><circle cx="160" cy="650" r="320" fill="black" opacity=".1"/><text x="600" y="355" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="64" font-weight="700">${safeDomain}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const mockLinkPreviewApi = {
  async resolve(url: string, signal?: AbortSignal): Promise<LinkPreview> {
    await delay(300);
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
        : createPlaceholderImage(domain),
    };
  },
};
