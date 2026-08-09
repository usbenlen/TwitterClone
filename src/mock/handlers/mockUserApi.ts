/** @format */

import type { User } from "@/types/user";
import type { UpdateProfileRequest } from "@/api";

import { sampleAuthors } from "@/mock/data/users";
import { delay } from "@/mock/utils/delay";

export const mockUserApi = {
  async getByUsername(username: string): Promise<User> {
    await delay();

    const found = sampleAuthors.find((user) => user.username === username);
    if (!found) throw new Error("Користувача не знайдено");

    return found;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    await delay();

    const user = sampleAuthors.find((item) => item.id === "u1");
    if (!user) throw new Error("Користувача не знайдено");

    user.displayName = data.displayName;

    user.bio = data.bio;
    if (data.location !== undefined) user.location = data.location ?? undefined;

    if (data.avatar) user.avatarUrl = URL.createObjectURL(data.avatar);
    if (data.banner) user.bannerUrl = URL.createObjectURL(data.banner);

    return {
      ...user,
    };
  },
};
