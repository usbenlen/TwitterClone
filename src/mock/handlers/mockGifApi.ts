import type { Gif } from "@/features/content/types";

export const mockGifApi = {
  available: false,
  async search(): Promise<Gif[]> {
    return [];
  },
};
