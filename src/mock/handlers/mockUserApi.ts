/** @format */

import type { User } from "@/types/user";
import { sampleAuthors } from "@/mock/data/users";
import { delay } from "@/mock/utils/delay";

export const mockUserApi = {
  async getByUsername(username: string): Promise<User> {
    await delay();

    const found = sampleAuthors.find((u) => u.username === username);
    if (!found) throw new Error("Користувача не знайдено");

    return found;
  },
};
