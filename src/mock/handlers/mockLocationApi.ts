import { MOCK_DELAYS } from "@/mock/constants";
import { locations } from "@/mock/data/locations";

import type { Location } from "@/types/location";

import { delay } from "@/mock/utils/delay";

export const mockLocationApi = {
  async search(query: string, signal?: AbortSignal): Promise<Location[]> {
    await delay(MOCK_DELAYS.SEARCH, signal);

    const value = query.trim().toLowerCase();
    if (!value) return [];

    return locations.filter(
      (location) =>
        location.name.toLowerCase().includes(value) ||
        location.country.toLowerCase().includes(value),
    );
  },
};
