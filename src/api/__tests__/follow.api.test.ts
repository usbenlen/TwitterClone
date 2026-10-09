import { beforeEach, describe, expect, it, vi } from "vitest";

import { realFollowApi } from "@/api/follow.api";

const client = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("@/api/client", () => ({ apiClient: client }));
vi.mock("@/mock/handlers/index", () => ({
  MOCK_ENABLED: false,
  mockFollowApi: {},
}));

const user = {
  id: "u2",
  username: "ada",
  displayName: "Ada",
  isVerified: false,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("follow API responses", () => {
  it("keeps legacy array responses", async () => {
    client.get.mockResolvedValue([user]);

    await expect(realFollowApi.following("u1")).resolves.toEqual([user]);
  });

  it("unwraps paginated follower responses", async () => {
    client.get.mockResolvedValue({
      items: [user],
      pagination: { page: 1, total: 1, totalPages: 1 },
    });

    await expect(realFollowApi.followers("u1")).resolves.toEqual([user]);
  });

  it("rejects malformed list responses instead of breaking rendering", async () => {
    client.get.mockResolvedValue({ pagination: { total: 0 } });

    await expect(realFollowApi.following("u1")).rejects.toThrow(
      "Некоректна відповідь списку підписок.",
    );
  });
});
