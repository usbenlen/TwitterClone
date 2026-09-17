import { tweets } from "@/mock/data/tweets";
import type { Tweet } from "@/types/tweet";
import { delay } from "@/mock/utils/delay";

export const mockAdminTweetApi = {
  async getAll(): Promise<Tweet[]> {
    await delay();

    return [...tweets];
  },

  async getById(tweetId: string): Promise<Tweet> {
    await delay();

    const tweet = tweets.find(
        (tweet) => tweet.id === tweetId,
    );

    if (!tweet) {
      throw new Error("Публикация не найдена");
    }

    return { ...tweet };
  },

  async toggleDelete(
      tweetId: string,
      isDeleted: boolean,
  ): Promise<Tweet> {
    await delay();

    const tweet = tweets.find(
        (tweet) => tweet.id === tweetId,
    );

    if (!tweet) {
      throw new Error("Публикация не найдена");
    }

    tweet.isDeleted = isDeleted;

    return { ...tweet };
  },
};