import type { User, Tweet } from "@/types";

import type { UpdateProfileRequest } from "@/api";

import {
  sampleAuthors,
  tweets,
  currentUser,
  commentsByPostId,
} from "@/mock/data";

import { withAncestors } from "@/utils/ancestors";
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

const repostedCommentsByUsername: Record<string, string[]> = {
  [sampleAuthors[1].username]: ["c2"],
  [sampleAuthors[2].username]: ["c1"],
};

export const mockUserApi = {
  async getAll(): Promise<User[]> {
    await delay();

    return [...sampleAuthors];
  },

  async getById(id: string): Promise<User> {
    await delay();

    const found = sampleAuthors.find((user) => user.id === id);
    if (!found) throw new Error("Користувача не знайдено");

    return { ...found };
  },

  async getByUsername(username: string): Promise<User> {
    await delay();

    const found = sampleAuthors.find((user) => user.username === username);
    if (!found) throw new Error("Користувача не знайдено");

    return { ...found };
  },

  async getPosts(username: string): Promise<Tweet[]> {
    await delay();

    return tweets.filter((tweet) => tweet.author.username === username);
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

    const comments = Object.values(commentsByPostId).flat();

    if (username === currentUser.username) {
      return [
        ...tweets.filter((tweet) => tweet.repostedByMe),
        ...comments.filter((comment) => comment.repostedByMe),
      ];
    }

    const repostedIds = repostedTweetsByUsername[username] ?? [];
    const repostedCommentIds = repostedCommentsByUsername[username] ?? [];

    return [
      ...tweets.filter((tweet) => repostedIds.includes(tweet.id)),
      ...comments
        .filter((comment) => repostedCommentIds.includes(comment.id))
        .map((comment) => ({ ...comment, isComment: true })),
    ];
  },

  async getReplies(username: string): Promise<Tweet[]> {
    await delay();

    const result: Tweet[] = [];

    for (const [postId, comments] of Object.entries(commentsByPostId)) {
      const rootPost = tweets.find((tweet) => tweet.id === postId);

      const userComments = comments.filter(
        (comment) => comment.author.username === username,
      );

      for (const comment of userComments) {
        const reply = withAncestors(
          {
            ...comment,
            isComment: true,
            postId,
            parentCommentId: comment.parentCommentId ?? null,
          },
          rootPost,
          comments,
        );

        result.push({
          ...reply,
          replyToUsername:
            reply.ancestors?.at(-1)?.author.username ??
            rootPost?.author.username ??
            null,
        });
      }
    }

    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
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
