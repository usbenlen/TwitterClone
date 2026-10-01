import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/mock/utils/delay", () => ({ delay: async () => {} }));
beforeEach(() => vi.resetModules());

describe("mock follow relationships", () => {
  it("keeps each user's verification state and prevents duplicate relationships", async () => {
    const { currentUser, sampleAuthors } = await import("@/mock/data/users");
    const { mockFollowers, mockFollowing } = await import("@/mock/data/follow");
    const { mockFollowApi } = await import("@/mock/handlers/mockFollowApi");
    const target = sampleAuthors.find((user) => user.id !== currentUser.id)!;
    currentUser.isVerified = false;
    target.isVerified = true;
    mockFollowing[currentUser.id] = [];
    mockFollowers[target.id] = [];
    await mockFollowApi.follow({ targetUserId: target.id });
    await mockFollowApi.follow({ targetUserId: target.id });
    expect(mockFollowing[currentUser.id]).toHaveLength(1);
    expect(mockFollowing[currentUser.id][0].isVerified).toBe(true);
    expect(mockFollowers[target.id]).toHaveLength(1);
    expect(mockFollowers[target.id][0].isVerified).toBe(false);
    await mockFollowApi.unfollow({ targetUserId: target.id });
    expect(mockFollowing[currentUser.id]).toEqual([]);
    expect(mockFollowers[target.id]).toEqual([]);
  });
});
