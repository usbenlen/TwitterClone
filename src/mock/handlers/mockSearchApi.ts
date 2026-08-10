/** @format */

import type { Tweet, UserShort } from "@/types";

import { sampleAuthors, tweets } from "@/mock/data";
import { delay } from "@/mock/utils/delay";

export const mockSearchApi = {
  async users(query: string): Promise<UserShort[]> {
    await delay(250);

    const value = query.trim().toLowerCase();

    if (!value) return [];

    return sampleAuthors
      .filter(
        (user) =>
          user.username.toLowerCase().includes(value) ||
          (user.displayName ?? "").toLowerCase().includes(value) ||
          (user.location?.name ?? "").toLowerCase().includes(value) ||
          (user.location?.country ?? "").toLowerCase().includes(value),
      )
      .map((user) => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        location: user.location,
        avatarUrl: user.avatarUrl ?? null,
        isVerified: user.isVerified,
      }));
  },

  async posts(query: string): Promise<Tweet[]> {
    await delay(250);

    const value = query.trim().toLowerCase();

    if (!value) return [];

    return tweets.filter((tweet) =>
      tweet.content.toLowerCase().includes(value),
    );
  },
};
