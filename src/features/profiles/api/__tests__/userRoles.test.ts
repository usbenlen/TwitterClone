import { beforeEach, describe, expect, it, vi } from "vitest";

import { authApi } from "@/features/auth/api/authApi";
import { commentApi } from "@/features/content/api/commentApi";
import {
  mapBackendPost,
  mapEditHistoryResponse,
  mapRepostToPost,
} from "@/features/content/api/mappers/postMapper";
import { recommendationsApi } from "@/features/discovery/api/recommendationApi";
import { searchApi } from "@/features/discovery/api/searchApi";
import { DEFAULT_SEARCH_CRITERIA } from "@/features/discovery/constants/search";
import { realFollowApi } from "@/features/profiles/api/followApi";
import {
  mapUserRole,
  normalizeUserRole,
} from "@/features/profiles/api/mappers/profileMapper";
import { userApi } from "@/features/profiles/api/profileApi";

import type { BackendPost } from "@/features/content/types/post.dto";
import type { User } from "@/features/profiles/types/user";

const client = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock("@/shared/api/httpClient", () => ({ apiClient: client }));
vi.mock("@/shared/config/mockConfig", () => ({ MOCK_ENABLED: false }));
vi.mock("@/shared/config/mockConfig", () => ({
  MOCK_ENABLED: false
}));
vi.mock("@/mock/handlers/mockAuthApi", () => ({
  mockAuthApi: {}
}));
vi.mock("@/mock/handlers/mockUserApi", () => ({
  mockUserApi: {}
}));
vi.mock("@/mock/handlers/mockFollowApi", () => ({
  mockFollowApi: {}
}));
vi.mock("@/mock/handlers/mockSearchApi", () => ({
  mockSearchApi: {}
}));
vi.mock("@/mock/handlers/mockRecommendationsApi", () => ({
  mockRecommendationsApi: {}
}));
vi.mock("@/mock/handlers/mockCommentApi", () => ({
  mockCommentApi: {}
}));

const user = { id: "u1", username: "admin", role: "ADMIN", isVerified: false };
const post: BackendPost = {
  id: "p1",
  versionId: "v1",
  content: "Hello",
  author: user,
  likesCount: 0,
  commentsCount: 0,
  repostsCount: 0,
  viewsCount: 0,
  isLikedByCurrentUser: false,
  createdAt: "2026-10-09T10:00:00Z",
};

beforeEach(() => vi.resetAllMocks());

describe("server user roles", () => {
  it.each([
    ["Admin", "Admin"],
    ["ADMIN", "Admin"],
    ["User", "User"],
    ["USER", "User"],
    [undefined, undefined],
    [null, undefined],
    ["unknown", undefined],
    ["admin", undefined],
    [1, undefined],
  ] as const)("normalizes role %s to %s", (role, expected) => {
    expect(normalizeUserRole(role)).toBe(expected);
  });

  it("preserves user data and verification independently of the role", () => {
    expect(mapUserRole(user)).toEqual({ ...user, role: "Admin" });
    expect(user.role).toBe("ADMIN");
    expect(mapUserRole({ ...user, role: undefined }).role).toBeUndefined();
  });

  it.each([
    ["current user", () => authApi.me()],
    ["profile by ID", () => userApi.getById("u1")],
    ["profile by username", () => userApi.getByUsername("admin")],
  ] as const)("normalizes the %s response", async (_name, read) => {
    client.get.mockResolvedValue(user);
    await expect(read()).resolves.toMatchObject({
      role: "Admin",
      isVerified: false,
    });
  });

  it("preserves the canonical role after a profile update", async () => {
    client.put.mockResolvedValue(user);
    await expect(
      userApi.updateProfile({ bio: "Updated" }),
    ).resolves.toMatchObject({ role: "Admin", isVerified: false });
  });

  it.each([
    ["followers", () => realFollowApi.followers("u1")],
    ["following", () => realFollowApi.following("u1")],
    ["search", () => searchApi.users(DEFAULT_SEARCH_CRITERIA)],
    [
      "recommendations",
      async () => (await recommendationsApi.users(5)).items,
    ],
  ] as const)("normalizes %s list items", async (_name, read) => {
    client.get.mockResolvedValue({
      items: [user],
      nextCursor: null,
      hasMore: false,
    });
    await expect(read()).resolves.toMatchObject([
      { role: "Admin", isVerified: false },
    ]);
  });

  it("normalizes authors in posts, nested quotes, edit history and reposts", () => {
    const quotedPost: BackendPost = {
      ...post,
      quote: {
        targetType: "post",
        targetId: "quoted",
        targetVersionId: "v2",
        hasNewVersion: false,
        target: { ...post, id: "quoted" },
      },
    };
    const mapped = mapBackendPost(quotedPost);
    expect(mapped.author).toMatchObject({ role: "Admin", isVerified: false });
    expect(mapped.quote?.target?.author.role).toBe("Admin");
    const history = mapEditHistoryResponse({
      targetType: "post",
      targetId: post.id,
      versions: [quotedPost],
    });
    expect(history.versions[0].quote?.target?.author.role).toBe("Admin");
    expect(mapRepostToPost(post).author.role).toBe("Admin");
    expect(
      mapRepostToPost({
        ...mapped,
        author: { ...mapped.author, role: "ADMIN" as User["role"] },
      }).author.role,
    ).toBe("Admin");
  });

  it("normalizes authors in comment thread targets, ancestors and replies", async () => {
    client.get
      .mockRejectedValueOnce(
        Object.assign(new Error("Not a post"), { status: 404 }),
      )
      .mockResolvedValueOnce({
        post,
        ancestors: [{ ...post, id: "parent" }],
        target: { ...post, id: "comment" },
        replies: {
          items: [{ ...post, id: "reply" }],
          nextCursor: null,
          hasMore: false,
        },
      });
    const thread = await commentApi.getThread("comment");
    for (const item of [
      thread.target,
      ...thread.ancestors,
      ...thread.replies,
      ...thread.replies[0].ancestors!,
    ]) {
      expect(item.author).toMatchObject({ role: "Admin", isVerified: false });
    }
  });
});
