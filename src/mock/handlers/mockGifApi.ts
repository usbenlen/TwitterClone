import type { Gif } from "@/types/gif";

export const mockGifApi = {
  available: false,
  async search(): Promise<Gif[]> {
    return [];
  },
};
