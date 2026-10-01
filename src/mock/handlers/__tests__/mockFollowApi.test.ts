import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/mock/utils/delay", () => ({ delay: async () => {} }));
beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllEnvs());

describe("mock follow relationships", () => {
  it("keeps each user's verification state and prevents duplicate relationships", async () => {
    const { currentUser, sampleAuthors } = await import("@/mock/data/users");
    const { mockFollowers, mockFollowing } = await import("@/mock/data/follow");
    const { mockFollowApi } = await import("@/mock/handlers/mockFollowApi");
    const target = sampleAuthors.find((user) => user.id !== currentUser.id)!;
    currentUser.isVerified = false;
    currentUser.role = "ADMIN";
    target.isVerified = true;
    target.role = "USER";
    mockFollowing[currentUser.id] = [];
    mockFollowers[target.id] = [];
    await mockFollowApi.follow({ targetUserId: target.id });
    await mockFollowApi.follow({ targetUserId: target.id });
    expect(mockFollowing[currentUser.id]).toHaveLength(1);
    expect(mockFollowing[currentUser.id][0].isVerified).toBe(true);
    expect(mockFollowing[currentUser.id][0].role).toBe("USER");
    expect(mockFollowers[target.id]).toHaveLength(1);
    expect(mockFollowers[target.id][0].isVerified).toBe(false);
    expect(mockFollowers[target.id][0].role).toBe("ADMIN");
    await mockFollowApi.unfollow({ targetUserId: target.id });
    expect(mockFollowing[currentUser.id]).toEqual([]);
    expect(mockFollowers[target.id]).toEqual([]);
  });

  it("preserves the configured admin role in initial followers and comments", async () => {
    vi.stubEnv("VITE_USE_MOCK", "true");
    vi.stubEnv("VITE_MOCK_USER_ROLE", "ADMIN");
    const { currentUser } = await import("@/mock/data/users");
    const { mockFollowers } = await import("@/mock/data/follow");
    const { commentsByPostId } = await import("@/mock/data/comments");

    const follower = mockFollowers.u2.find((entry) => entry.id === currentUser.id);
    expect(follower).toMatchObject({ role: "ADMIN", isVerified: false });
    const comment = Object.values(commentsByPostId)
      .flat()
      .find((entry) => entry.author.id === currentUser.id);
    expect(comment?.author).toMatchObject({ role: "ADMIN", isVerified: false });
  });
});
