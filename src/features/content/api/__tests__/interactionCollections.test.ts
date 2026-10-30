import { afterEach, describe, expect, it, vi } from "vitest";

import { postApi } from "@/features/content/api/postApi";
import { userApi } from "@/features/profiles/api/profileApi";
import { ENDPOINTS } from "@/shared/api/apiEndpoints";
import { apiClient } from "@/shared/api/httpClient";

import type { BackendPost } from "@/features/content/types/post.dto";

vi.mock("@/shared/config/mockConfig", () => ({ MOCK_ENABLED: false }));
afterEach(() => vi.restoreAllMocks());

const post: BackendPost = {
  id: "same-id", versionId: "post-v1", content: "Post",
  author: {
    id: "user", username: "author", displayName: "Author",
    avatarUrl: null, isVerified: false,
  },
  likesCount: 1, repostsCount: 0, viewsCount: 0,
  isLikedByCurrentUser: true, isBookmarkedByCurrentUser: true,
  createdAt: "2026-10-20T12:00:00Z",
  actionAt: "2026-10-21T12:00:00Z",
};

describe("real mixed interaction collections", () => {
  it.each([
    { name: "bookmarks", load: () => postApi.getBookmarked(), path: ENDPOINTS.posts.bookmarked },
    { name: "likes", load: () => userApi.getLikes("author"), path: ENDPOINTS.users.likes("author") },
    { name: "reposts", load: () => userApi.getReposts("author"), path: ENDPOINTS.users.reposts("author") },
  ])("reads posts and comments with one request for $name", async ({ load, path }) => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      posts: [post],
      comments: [{
        ...post, versionId: "comment-v1", postId: "root", content: "Comment",
        replyToUsername: "recipient",
        actionAt: "2026-10-22T12:00:00Z",
      }],
      nextCursor: null, hasMore: false,
    });
    const result = await load();
    expect(get).toHaveBeenCalledExactlyOnceWith(path);
    expect(result).toHaveLength(2);
    expect(result.map((item) => [item.id, item.isComment])).toEqual([
      ["same-id", true], ["same-id", false],
    ]);
    expect(result.every((item) => item.likedByMe && item.bookmarkedByMe)).toBe(true);
    expect(result[0].postId).toBe("root");
    expect(result[0].replyToUsername).toBe("recipient");
  });

  describe.each(["likes", "reposts"] as const)("%s reply metadata", (tab) => {
    it.each([
      { parentCommentId: null, replyToUsername: "root-author" },
      { parentCommentId: "parent", replyToUsername: "parent-author" },
      { parentCommentId: "missing-parent", replyToUsername: undefined },
    ])("preserves the direct recipient: %j", async (context) => {
      const get = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
        posts: [],
        comments: [{ ...post, postId: "root", ...context }],
        nextCursor: null, hasMore: false,
      });
      const result = await (tab === "likes" ? userApi.getLikes : userApi.getReposts)("author");
      expect(get).toHaveBeenCalledExactlyOnceWith(ENDPOINTS.users[tab]("author"));
      expect(result[0]).toMatchObject({
        isComment: true,
        postId: "root",
        parentCommentId: context.parentCommentId,
        replyToUsername: context.replyToUsername ?? null,
      });
    });
  });
});
