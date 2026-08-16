import { MOCK_ENABLED } from "@/mock/config";

import { mockEmbedApi } from "@/mock/handlers/mockEmbedApi";

import type { Embed } from "@/types/embed";

const realEmbedApi = {
  async resolve(): Promise<Embed> {
    throw new Error("Real API not implemented.");
  },
};

export const embedApi = MOCK_ENABLED ? mockEmbedApi : realEmbedApi;
