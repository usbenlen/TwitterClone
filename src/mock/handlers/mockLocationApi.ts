/** @format */

import type { Location } from "@/types/location";

import { locations } from "@/mock/data/locations";
import { delay } from "@/mock/utils/delay";

export const mockLocationApi = {
  async search(query: string): Promise<Location[]> {
    await delay(250);

    const value = query.trim().toLowerCase();
    if (!value) return [];

    return locations.filter(
      (location) =>
        location.name.toLowerCase().includes(value) ||
        location.country.toLowerCase().includes(value),
    );
  },
};
