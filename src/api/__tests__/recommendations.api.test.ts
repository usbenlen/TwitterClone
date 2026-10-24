import { beforeEach, describe, expect, it, vi } from "vitest";

import { recommendationsApi } from "@/api/recommendations.api";

const client = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/api/client", () => ({ apiClient: client }));
vi.mock("@/mock/config", () => ({ MOCK_ENABLED: false }));
vi.mock("@/mock/handlers", () => ({ mockRecommendationsApi: {} }));

beforeEach(() => vi.resetAllMocks());

describe("real recommendation requests", () => {
  it("maps recommended post DTOs and preserves the opaque page cursor", async () => {
    const cursor = "opaque+/=?&ю";
    client.get.mockResolvedValue({
      items: [{
        id: "p1", versionId: "v1", content: "hello",
        author: { id: "u2", username: "ada", role: "ADMIN" },
        likesCount: 3, commentsCount: 4, repostsCount: 5, viewsCount: 6,
        isLikedByCurrentUser: true, createdAt: "2026-01-01T00:00:00Z",
      }],
      nextCursor: "next-opaque", hasMore: true,
    });
    const page = await recommendationsApi.posts(10, cursor);
    expect(page).toMatchObject({
      items: [{ id: "p1", author: { role: "Admin" }, repliesCount: 4, retweetsCount: 5, likedByMe: true }],
      nextCursor: "next-opaque", hasMore: true,
    });
    const url = new URL(client.get.mock.calls[0][0], "https://example.com/");
    expect(url.pathname).toBe("/recommendations/posts");
    expect(url.searchParams.get("limit")).toBe("10");
    expect(url.searchParams.get("cursor")).toBe(cursor);
  });

  it("reads recommendations instead of search and preserves the cursor envelope", async () => {
    client.get.mockResolvedValue({
      items: [{ id: "u2", username: "ada", role: "ADMIN", isVerified: false }],
      nextCursor: "protected-next-cursor",
      hasMore: true,
    });

    await expect(recommendationsApi.users(4)).resolves.toEqual({
      items: [{ id: "u2", username: "ada", role: "Admin", isVerified: false }],
      nextCursor: "protected-next-cursor",
      hasMore: true,
    });
    expect(client.get).toHaveBeenCalledWith("recommendations/users?limit=4");
  });

  it("passes an opaque cursor without interpreting or changing its value", async () => {
    const cursor = "opaque+/=?&ю";
    client.get.mockResolvedValue({
      items: [],
      nextCursor: null,
      hasMore: false,
    });

    await recommendationsApi.users(4, cursor);

    const url = new URL(client.get.mock.calls[0][0], "https://example.com/");
    expect(url.pathname).toBe("/recommendations/users");
    expect(url.searchParams.get("cursor")).toBe(cursor);
    expect(url.searchParams.has("category")).toBe(false);
  });

  it("requests trends and retains their search queries and optional counts", async () => {
    const response = {
      items: [
        {
          id: "t1",
          title: "#Київ",
          context: "Україна",
          query: "#Київ",
          postsCount: 12,
        },
      ],
    };
    client.get.mockResolvedValue(response);

    await expect(recommendationsApi.trends(4)).resolves.toEqual(response);
    expect(client.get).toHaveBeenCalledWith("recommendations/trends?limit=4");
  });

  it.each(["users", "trends", "posts"] as const)(
    "propagates %s failures and permits another request",
    async (kind) => {
      const error = new Error("Endpoint unavailable");
      client.get.mockRejectedValueOnce(error).mockResolvedValueOnce({
        items: [],
        nextCursor: null,
        hasMore: false,
      });

      await expect(recommendationsApi[kind](4)).rejects.toBe(error);
      await expect(recommendationsApi[kind](4)).resolves.toMatchObject({
        items: [],
      });
      expect(client.get).toHaveBeenCalledTimes(2);
    },
  );
});
