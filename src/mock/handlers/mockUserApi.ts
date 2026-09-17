import type { User, Tweet } from "@/types";
import type { UpdateProfileRequest } from "@/api";

import { sampleAuthors, tweets, currentUser } from "@/mock/data";
import { delay } from "@/mock/utils/delay";

const likedTweetsByUsername: Record<string, string[]> = {
  [currentUser.username]: ["t2"],
  [sampleAuthors[1].username]: ["t1", "t3"],
  [sampleAuthors[2].username]: ["t1"],
};

const repostedTweetsByUsername: Record<string, string[]> = {
  [sampleAuthors[1].username]: ["t3"],
  [sampleAuthors[2].username]: ["t2"],
};

export const mockUserApi = {
  getUserByUsername: async (username: string) => {
    const user = sampleAuthors.find(
        (u) => u.username === username
    );

    if (!user || user.isBlocked) {
      return null;
    }

    return user;
  },

  toggleBlock: async (userId: string, blocked: boolean) => {
    await delay();

    const user = sampleAuthors.find((user) => user.id === userId);

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    user.isBlocked = blocked;

    return { ...user };
  },

  async toggleDelete(tweetId: string, isDeleted: boolean): Promise<Tweet> {
    await delay();

    const tweet = tweets.find((item) => item.id === tweetId);

    if (!tweet) {
      throw new Error("Публикация не найдена");
    }

    tweet.isDeleted = isDeleted;

    return { ...tweet };
  },

  async getAll(): Promise<User[]> {
    await delay();

    return [...sampleAuthors];
  },

  async getById(id: string): Promise<Tweet> {
    await delay();

    const tweet = tweets.find((item) => item.id === id);

    if (!tweet) {
      throw new Error("Пост не найден");
    }

    const author = sampleAuthors.find(
        (user) => user.id === tweet.author.id,
    );

    if (tweet.isDeleted || author?.isBlocked) {
      throw new Error("Пост не найден");
    }

    return {
      ...tweet,
      author: author
          ? { ...author }
          : tweet.author,
    };
  },

  async getByUsername(username: string): Promise<User | null> {
    await delay();

    const user = sampleAuthors.find(
        (u) => u.username === username,
    );

    if (!user || user.isBlocked) {
      return null;
    }

    return { ...user };
  },

  async getPosts(id: string): Promise<Tweet[]> {
    await delay();

    return tweets.filter((tweet) => tweet.author.id === id);
  },

  async getLikes(username: string): Promise<Tweet[]> {
    await delay();

    if (username === currentUser.username)
      return tweets.filter((tweet) => tweet.likedByMe);

    const likedIds = likedTweetsByUsername[username] ?? [];

    return tweets.filter((tweet) => likedIds.includes(tweet.id));
  },

  async getReposts(username: string): Promise<Tweet[]> {
    await delay();

    if (username === currentUser.username)
      return tweets.filter((tweet) => tweet.repostedByMe);

    const repostedIds = repostedTweetsByUsername[username] ?? [];

    return tweets.filter((tweet) => repostedIds.includes(tweet.id));
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    await delay(300);

    const user = sampleAuthors.find((item) => item.id === currentUser.id);
    if (!user) throw new Error("Користувача не знайдено");

    if (data.displayName !== undefined) user.displayName = data.displayName;

    if (data.bio !== undefined) user.bio = data.bio;

    if (data.removeLocation) user.location = null;
    else if (data.location !== undefined) user.location = data.location;

    if (data.removeAvatar) user.avatarUrl = null;
    else if (data.avatar) user.avatarUrl = URL.createObjectURL(data.avatar);

    if (data.removeBanner) user.bannerUrl = null;
    else if (data.banner) user.bannerUrl = URL.createObjectURL(data.banner);

    return {
      ...user,
    };
  },

  async deleteMe(): Promise<void> {
    await delay(300);

    // Поки достатньо емуляції видалення. Якщо треба на далі то ось нижче працюючий варіант

    // const index = sampleAuthors.findIndex((user) => user.id === currentUser.id);
    // if (index === -1) throw new Error("Користувача не знайдено");

    // sampleAuthors.splice(index, 1);
  },
};
