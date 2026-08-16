import type { Embed } from "@/types/embed";

import { delay } from "@/mock/utils/delay";

function getYoutubeId(url: string) {
  const match = url.match(/v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
  return match?.[1] ?? null;
}

function getVimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] ?? null;
}

export const mockEmbedApi = {
  async resolve(url: string): Promise<Embed> {
    await delay(300);

    const youtubeId = getYoutubeId(url);
    if (youtubeId) {
      return {
        id: crypto.randomUUID(),
        provider: "youtube",
        url,
        embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
        title: "YouTube Video",
      };
    }

    const vimeoId = getVimeoId(url);
    if (vimeoId) {
      return {
        id: crypto.randomUUID(),
        provider: "vimeo",
        url,
        embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
        thumbnailUrl: "https://via.placeholder.com/640x360?text=Vimeo",
        title: "Vimeo Video",
      };
    }

    throw new Error("Unsupported url.");
  },
};
