import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { tweetApi } from "@/api/tweet.api";
import { userApi } from "@/api/user.api";
import type { BackendPost } from "@/api/mappers/post.mapper";

vi.mock("@/mock/config", () => ({ MOCK_ENABLED: false }));
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
    { name: "bookmarks", load: () => tweetApi.getBookmarked(), path: ENDPOINTS.posts.bookmarked },
    { name: "likes", load: () => userApi.getLikes("author"), path: ENDPOINTS.users.likes("author") },
  ])("reads posts and comments with one request for $name", async ({ load, path }) => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      posts: [post],
      comments: [{
        ...post, versionId: "comment-v1", postId: "root", content: "Comment",
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
  });
});
