import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/mock/utils/delay", () => ({ delay: async () => {} }));
beforeEach(() => vi.resetModules());

describe("mock author recommendations", () => {
  it("paginates existing posts by date without mutating the fixture order", async () => {
    const { tweets } = await import("@/mock/data");
    const originalOrder = tweets.map((tweet) => tweet.id);
    const { mockRecommendationsApi } =
      await import("@/mock/handlers/mockRecommendationsApi");
    const first = await mockRecommendationsApi.posts(2);
    const pages = [first];
    while (pages.at(-1)!.hasMore) {
      const next = await mockRecommendationsApi.posts(
        2,
        pages.at(-1)!.nextCursor,
      );
      expect(next.items.length).toBeGreaterThan(0);
      expect(next.items.length).toBeLessThanOrEqual(2);
      pages.push(next);
      expect(pages.length).toBeLessThanOrEqual(Math.ceil(tweets.length / 2));
    }
    expect(first.items).toHaveLength(2);
    expect(first.hasMore).toBe(true);
    expect(pages.at(-1)!.hasMore).toBe(false);
    expect(pages.at(-1)!.nextCursor).toBeNull();
    expect(
      new Set(pages.flatMap((page) => page.items).map((post) => post.id)).size,
    ).toBe(tweets.length);
    expect(Date.parse(first.items[0].createdAt)).toBeGreaterThanOrEqual(
      Date.parse(first.items[1].createdAt),
    );
    expect(tweets.map((tweet) => tweet.id)).toEqual(originalOrder);
  });

  it("paginates one list without duplicates and ends with a complete envelope", async () => {
    const { mockRecommendationsApi } =
      await import("@/mock/handlers/mockRecommendationsApi");
    const first = await mockRecommendationsApi.users(4);
    const second = await mockRecommendationsApi.users(4, first.nextCursor);

    expect(first.items).toHaveLength(4);
    expect(first.hasMore).toBe(true);
    expect(second.items).toHaveLength(2);
    expect(second.hasMore).toBe(false);
    expect(second.nextCursor).toBeNull();
    const ids = [...first.items, ...second.items].map((user) => user.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("excludes self and follows before paging, and restores an author after unfollow", async () => {
    const { currentUser } = await import("@/mock/data/users");
    const { mockFollowApi } = await import("@/mock/handlers/mockFollowApi");
    const { mockRecommendationsApi } =
      await import("@/mock/handlers/mockRecommendationsApi");
    const initial = await mockRecommendationsApi.users(4);
    const author = initial.items[0];
    expect(initial.items.every((user) => user.id !== currentUser.id)).toBe(
      true,
    );

    await mockFollowApi.follow({ targetUserId: author.id });
    const followed = await mockRecommendationsApi.users(4);
    expect(followed.items).toHaveLength(4);
    expect(followed.items.some((user) => user.id === author.id)).toBe(false);

    await mockFollowApi.unfollow({ targetUserId: author.id });
    expect((await mockRecommendationsApi.users(4)).items[0].id).toBe(author.id);
  });

  it("returns an empty final page when all recommended authors are followed", async () => {
    const { mockFollowApi } = await import("@/mock/handlers/mockFollowApi");
    const { mockRecommendationsApi } =
      await import("@/mock/handlers/mockRecommendationsApi");
    for (const user of (await mockRecommendationsApi.users(50)).items) {
      await mockFollowApi.follow({ targetUserId: user.id });
    }
    await expect(mockRecommendationsApi.users(4)).resolves.toEqual({
      items: [],
      nextCursor: null,
      hasMore: false,
    });
  });
});
