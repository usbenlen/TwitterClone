/** @format */

import { GIPHY_API_KEY } from "@/constants/app";

import type { Gif } from "@/types/gif";

const BASE_URL = "https://api.giphy.com/v1/gifs";

const LIMIT = 24;
const RATING = "pg-13";

interface GiphyGif {
  id: string;
  title: string;

  images: {
    original: {
      url: string;
      width: string;
      height: string;
    };

    fixed_width: {
      url: string;
    };
  };
}

interface GiphyResponse {
  data: GiphyGif[];
}

function mapGif(item: GiphyGif): Gif {
  return {
    id: item.id,

    title: item.title,

    originalUrl: item.images.original.url,

    previewUrl: item.images.fixed_width.url,

    width: Number(item.images.original.width),
    height: Number(item.images.original.height),
  };
}

async function request(url: string): Promise<Gif[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch GIFs.");
  }

  const json: GiphyResponse = await response.json();

  return json.data.map(mapGif);
}

export const gifApi = {
  async trending(limit = LIMIT) {
    return request(
      `${BASE_URL}/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=${RATING}`,
    );
  },

  async search(query: string, limit = LIMIT) {
    if (!query.trim()) {
      return [];
    }

    return request(
      `${BASE_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
        query,
      )}&limit=${limit}&rating=${RATING}`,
    );
  },
};
