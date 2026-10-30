import { MOCK_DELAYS } from "@/mock/mockConfig";

import type { User, Post, UpdateProfileRequest } from "@/types";

import { sampleAuthors, currentUser } from "@/mock/data/users";
import { posts } from "@/mock/data/posts";
import { commentsByPostId } from "@/mock/data/comments";

import { withAncestors } from "@/utils/posts/ancestors";
import { updatePostAuthors } from "@/utils/posts/updatePostAuthors";
import { delay } from "@/mock/utils/delay";
import { selectMockComments } from "@/mock/utils/selectMockComments";

const likedPostsByUsername: Record<string, string[]> = {
  [currentUser.username]: ["t2"],
  [sampleAuthors[1].username]: ["t1", "t3"],
  [sampleAuthors[2].username]: ["t1"],
};

const repostedPostsByUsername: Record<string, string[]> = {
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

  async getPosts(username: string): Promise<Post[]> {
    await delay();

    return posts.filter((post) => post.author.username === username);
  },

  async getLikes(username: string): Promise<Post[]> {
    await delay();

    if (username === currentUser.username)
      return [
        ...posts.filter((post) => post.likedByMe),
        ...selectMockComments((comment) => comment.likedByMe),
      ];

    const likedIds = likedPostsByUsername[username] ?? [];

    return posts.filter((post) => likedIds.includes(post.id));
  },

  async getReposts(username: string): Promise<Post[]> {
    await delay();

    if (username === currentUser.username) {
      return [
        ...posts.filter((post) => post.repostedByMe),
        ...selectMockComments((comment) => comment.repostedByMe),
      ];
    }

    const repostedIds = repostedPostsByUsername[username] ?? [];
    const repostedCommentIds = repostedCommentsByUsername[username] ?? [];

    return [
      ...posts.filter((post) => repostedIds.includes(post.id)),
      ...selectMockComments((comment) => repostedCommentIds.includes(comment.id)),
    ];
  },

  async getReplies(username: string): Promise<Post[]> {
    await delay();

    const result: Post[] = [];

    for (const [postId, comments] of Object.entries(commentsByPostId)) {
      const rootPost = posts.find((post) => post.id === postId);

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
    await delay(MOCK_DELAYS.WRITE);

    const user = sampleAuthors.find((item) => item.id === currentUser.id);
    if (!user) throw new Error("Користувача не знайдено");

    if (data.displayName !== undefined) user.displayName = data.displayName;

    if (data.bio !== undefined) user.bio = data.bio;

    if (data.removeLocation) user.location = null;
    else if (data.location !== undefined) user.location = data.location;

    if (data.removeBirthDate) user.birthDate = null;
    else if (data.birthDate !== undefined) user.birthDate = data.birthDate;

    if (data.birthDateVisibility !== undefined) user.birthDateVisibility = data.birthDateVisibility;

    if (data.birthYearVisibility !== undefined) user.birthYearVisibility = data.birthYearVisibility;

    if (data.removeAvatar) user.avatarUrl = null;
    else if (data.avatar) user.avatarUrl = URL.createObjectURL(data.avatar);

    if (data.removeBanner) user.bannerUrl = null;
    else if (data.banner) user.bannerUrl = URL.createObjectURL(data.banner);

    updatePostAuthors(
      [...posts, ...Object.values(commentsByPostId).flat()],
      user,
    );

    return structuredClone(user);
  },

  async deleteMe(): Promise<void> {
    await delay(MOCK_DELAYS.WRITE);

    // Поки достатньо емуляції видалення. Якщо треба на далі то ось нижче працюючий варіант

    // const index = sampleAuthors.findIndex((user) => user.id === currentUser.id);
    // if (index === -1) throw new Error("Користувача не знайдено");

    // sampleAuthors.splice(index, 1);
  },
};
