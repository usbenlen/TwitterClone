/** @format */

import type { Location } from "@/types/location";

import { locations } from "@/mock/data/locations";
import { delay } from "@/mock/utils/delay";

export const mockLocationApi = {
  async search(query: string): Promise<Location[]> {
    await delay(250);

    if (!query.trim()) return locations.slice(0, 8);

    const value = query.toLowerCase();

    return locations.filter(
      (location) =>
        location.name.toLowerCase().includes(value) ||
        location.country.toLowerCase().includes(value),
    );
  },
};
