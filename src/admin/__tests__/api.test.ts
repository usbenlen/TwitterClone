import { beforeEach, describe, expect, it, vi } from "vitest";
import { realAdminApi, type BackendReport } from "@/admin/api";
import { reportApi } from "@/api/report.api";
import { USERS_DEFAULTS } from "@/admin/constants";

const client = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}));
vi.mock("@/mock/config", () => ({ MOCK_ENABLED: false }));
vi.mock("@/api/client", async (original) => ({
  ...(await original<typeof import("@/api/client")>()),
  apiClient: client,
}));
const report: BackendReport = {
  id: "r1",
  targetType: "comments",
  targetId: "c1",
  source: "user",
  status: "pending",
  reason: "spam",
  createdAt: "2026-10-01T00:00:00Z",
  target: {
    type: "comments",
    data: {
      id: "c1",
      versionId: "v1",
      content: "hello",
      author: { id: "u2", username: "ada", isVerified: false },
      likesCount: 2,
      commentsCount: 3,
      repostsCount: 4,
      viewsCount: 5,
      isLikedByCurrentUser: true,
      createdAt: "2026-10-01T00:00:00Z",
      postId: "p1",
    },
  },
};
beforeEach(() => {
  vi.resetAllMocks();
});
describe("HTTP administrative adapters", () => {
  it("maps moderation content through the existing backend post mapper", async () => {
    client.get.mockResolvedValue(report);
    const result = await realAdminApi.report("r/1");
    expect(client.get).toHaveBeenCalledWith("admin/moderation/r%2F1");
    expect(result.target).toMatchObject({
      type: "comments",
      data: {
        isComment: true,
        repliesCount: 3,
        retweetsCount: 4,
        likedByMe: true,
        attachments: [],
        postId: "p1",
      },
    });
  });
  it("resolves a report in one request without a separate target action", async () => {
    client.put.mockResolvedValue({
      ...report,
      status: "resolved",
      decision: "deleted",
      target: null,
    });
    await expect(
      realAdminApi.resolveReport("r1", "deleted"),
    ).resolves.toMatchObject({ target: null, decision: "deleted" });
    expect(client.put).toHaveBeenCalledExactlyOnceWith(
      "admin/moderation/r1/status",
      { status: "resolved", decision: "deleted" },
    );
    expect(client.delete).not.toHaveBeenCalled();
  });
  it("uses the branch's user action routes and encoded query values", async () => {
    client.get.mockResolvedValue({
      items: [],
      pagination: { page: 1, total: 0, totalPages: 1 },
    });
    await realAdminApi.users({
      ...USERS_DEFAULTS,
      search: " A&B ",
      status: "blocked",
    });
    expect(client.get.mock.calls[0][0]).toBe(
      "admin/users?page=1&search=A%26B&sort=newest&status=blocked",
    );
    await realAdminApi.actOnUser("u/2", "block");
    expect(client.put).toHaveBeenCalledWith("admin/users/u%2F2/block");
    await realAdminApi.actOnUser("u/2", "delete");
    expect(client.delete).toHaveBeenCalledWith("admin/users/u%2F2/delete");
  });
  it.each(["posts", "comments", "users"] as const)(
    "submits a public %s report through the shared client",
    async (targetType) => {
      await reportApi.create({ targetType, targetId: "a/b", reason: "spam" });
      expect(client.post).toHaveBeenCalledExactlyOnceWith(
        `${targetType}/a%2Fb/report`,
        { reason: "spam" },
      );
    },
  );
  it("propagates HTTP failures without falling back to mock data", async () => {
    client.put.mockRejectedValue(new Error("server unavailable"));
    await expect(realAdminApi.resolveReport("r1", "deleted")).rejects.toThrow(
      "server unavailable",
    );
  });
});
