import { beforeEach, describe, expect, it, vi } from "vitest";

import { commentApi } from "@/features/content/api/commentApi";
import { notificationsApi } from "@/features/notifications/api/notificationApi";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/features/notifications/constants/notification";

const client = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));
vi.mock("@/shared/api/httpClient", () => ({ apiClient: client }));
vi.mock("@/shared/config/mockConfig", () => ({ MOCK_ENABLED: false }));
vi.mock("@/mock/handlers/mockNotificationsApi", () => ({
  mockNotificationsApi: {},
}));
vi.mock("@/mock/handlers/mockCommentApi", () => ({
  mockCommentApi: {}
}));

beforeEach(() => vi.resetAllMocks());

describe("notifications HTTP contract", () => {
  it("maps actors and retains grouped data, snapshot and opaque cursor", async () => {
    client.get.mockResolvedValue({
      items: [
        {
          id: "group:1",
          type: "like",
          actors: [{ id: "u2", username: "ada", role: "ADMIN" }],
          actorCount: 4,
          target: { id: "same", type: "comment", preview: null },
          isRead: false,
          isMention: false,
        },
      ],
      nextCursor: "server-next",
      hasMore: true,
      readThrough: "snapshot:42",
    });
    const cursor = "opaque+/=?&ю";
    const page = await notificationsApi.list("mentions", 20, cursor);
    expect(page).toMatchObject({
      items: [
        {
          actors: [{ role: "Admin" }],
          actorCount: 4,
          target: { type: "comment", id: "same" },
        },
      ],
      nextCursor: "server-next",
      hasMore: true,
      readThrough: "snapshot:42",
    });
    const url = new URL(client.get.mock.calls[0][0], "https://example.com");
    expect(url.pathname).toBe("/notifications");
    expect(url.searchParams.get("tab")).toBe("mentions");
    expect(url.searchParams.get("limit")).toBe("20");
    expect(url.searchParams.get("cursor")).toBe(cursor);
  });

  it("sends read markers without changing them and accepts 204", async () => {
    client.post.mockResolvedValue(undefined);
    await expect(
      notificationsApi.read("group /?&", "opaque-marker"),
    ).resolves.toBeUndefined();
    expect(client.post).toHaveBeenLastCalledWith(
      "notifications/group%20%2F%3F%26/read",
      { readThrough: "opaque-marker" },
    );
    await expect(
      notificationsApi.readAll("opaque-marker"),
    ).resolves.toBeUndefined();
    expect(client.post).toHaveBeenLastCalledWith("notifications/read-all", {
      readThrough: "opaque-marker",
    });
  });

  it("loads counts/preferences and patches only requested settings", async () => {
    client.get
      .mockResolvedValueOnce({ count: 8 })
      .mockResolvedValueOnce(DEFAULT_NOTIFICATION_PREFERENCES);
    expect(await notificationsApi.unreadCount()).toEqual({ count: 8 });
    expect(client.get).toHaveBeenLastCalledWith("notifications/unread-count");
    expect(await notificationsApi.preferences()).toEqual(
      DEFAULT_NOTIFICATION_PREFERENCES,
    );
    expect(client.get).toHaveBeenLastCalledWith("notifications/preferences");
    client.patch.mockResolvedValue({
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      likes: false,
    });
    expect(
      await notificationsApi.updatePreferences({ likes: false }),
    ).toMatchObject({ likes: false, replies: true });
    expect(client.patch).toHaveBeenCalledWith("notifications/preferences", {
      likes: false,
    });
  });

  it("propagates failures and allows retry without a mock fallback", async () => {
    const error = Object.assign(new Error("Not implemented"), { status: 404 });
    client.get
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({
        items: [],
        nextCursor: null,
        hasMore: false,
        readThrough: "r",
      });
    await expect(notificationsApi.list("all", 20)).rejects.toBe(error);
    await expect(notificationsApi.list("all", 20)).resolves.toMatchObject({
      items: [],
    });
    client.post.mockRejectedValue(error);
    client.patch.mockRejectedValue(error);
    await expect(notificationsApi.readAll("r")).rejects.toBe(error);
    await expect(
      notificationsApi.updatePreferences({ likes: false }),
    ).rejects.toBe(error);
  });
});

describe("explicit notification thread targets", () => {
  const post = {
    id: "same",
    versionId: "v1",
    content: "post",
    author: { id: "u2", username: "ada" },
    createdAt: "2026-10-27T12:00:00Z",
  };
  it("opens the comment endpoint even when a post with the same ID exists", async () => {
    client.get.mockResolvedValue({
      post,
      target: { ...post, content: "comment" },
      ancestors: [],
      replies: { items: [], nextCursor: null, hasMore: false },
    });
    const thread = await commentApi.getThread("same", "comment");
    expect(client.get).toHaveBeenCalledTimes(1);
    expect(client.get).toHaveBeenCalledWith("comments/same/thread");
    expect(thread.target).toMatchObject({
      id: "same",
      isComment: true,
      content: "comment",
    });
  });

  it("retains old post links and never substitutes a comment for an explicit missing post", async () => {
    client.get.mockResolvedValueOnce(post).mockResolvedValueOnce({ items: [] });
    expect((await commentApi.getThread("same")).target.content).toBe("post");
    client.get.mockReset();
    const error = Object.assign(new Error("Missing"), { status: 404 });
    client.get.mockRejectedValue(error);
    await expect(commentApi.getThread("same", "post")).rejects.toBe(error);
    expect(client.get).toHaveBeenCalledTimes(1);
  });
});
