import { beforeEach, describe, expect, it, vi } from "vitest";

import { commentApi } from "@/features/content/api/commentApi";
import { mapNotification } from "@/features/notifications/api/mappers/notificationMapper";
import { notificationsApi } from "@/features/notifications/api/notificationApi";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/features/notifications/constants/notification";

import type {
  BackendNotification,
  BackendNotificationType,
} from "@/features/notifications/types/notification.dto";

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
vi.mock("@/mock/handlers/mockCommentApi", () => ({ mockCommentApi: {} }));

beforeEach(() => vi.resetAllMocks());

function notification(
  type: BackendNotificationType = "CommentLike",
): BackendNotification {
  return {
    id: "notification-id",
    type,
    actor: { id: "u2", username: "ada", isVerified: true, role: "ADMIN" },
    sourceId: "new-source",
    postId: "parent-post",
    commentId: "parent-comment",
    createdAt: "2026-10-31T10:00:00Z",
    readAt: null,
  };
}

describe("notifications HTTP contract", () => {
  it("maps the real DTO and preserves server ordering and the opaque cursor without a read marker", async () => {
    client.get.mockResolvedValue({
      items: [notification(), { ...notification("Follow"), id: "second" }],
      nextCursor: "server-next",
      hasMore: true,
    });
    const cursor = "opaque+/=?&ю";
    const page = await notificationsApi.list("all", 20, cursor);
    expect(page.items.map((item) => item.id)).toEqual([
      "notification-id",
      "second",
    ]);
    expect(page).toMatchObject({
      items: [
        {
          actors: [{ role: "Admin" }],
          actorCount: 1,
          target: { type: "comment", id: "parent-comment", preview: null },
          isRead: false,
          updatedAt: "2026-10-31T10:00:00Z",
        },
        { type: "follow", target: null },
      ],
      nextCursor: "server-next",
      hasMore: true,
    });
    expect(page).not.toHaveProperty("readThrough");
    const url = new URL(client.get.mock.calls[0][0], "https://example.com");
    expect(url.pathname).toBe("/notifications");
    expect(url.searchParams.has("tab")).toBe(false);
    expect(url.searchParams.get("limit")).toBe("20");
    expect(url.searchParams.get("cursor")).toBe(cursor);
  });

  it.each([
    ["Follow", "follow", null, null],
    ["PostLike", "like", "post", "parent-post"],
    ["CommentLike", "like", "comment", "parent-comment"],
    ["PostRepost", "repost", "post", "parent-post"],
    ["CommentRepost", "repost", "comment", "parent-comment"],
    ["PostComment", "reply", "comment", "new-source"],
    ["CommentReply", "reply", "comment", "new-source"],
    ["Quote", "quote", "post", "new-source"],
  ] as const)(
    "maps %s to its correct event and navigation target",
    (backendType, type, targetType, id) => {
      const result = mapNotification(notification(backendType));
      expect(result.type).toBe(type);
      expect(result.target).toEqual(
        targetType ? { type: targetType, id, preview: null } : null,
      );
    },
  );

  it("derives read state without reordering the notification and tolerates absent user roles", () => {
    const dto = notification();
    delete dto.actor.role;
    const result = mapNotification({ ...dto, readAt: "2026-10-31T11:00:00Z" });
    expect(result.isRead).toBe(true);
    expect(result.updatedAt).toBe(dto.createdAt);
    expect(result.actors[0].isVerified).toBe(true);
    expect(result.isMention).toBe(false);
    expect(() => mapNotification({ ...dto, type: "Unknown" as never })).toThrow(
      "Невідомий тип",
    );
  });

  it("uses PATCH without a body for both read actions and accepts 204", async () => {
    client.patch.mockResolvedValue(undefined);
    await expect(
      notificationsApi.read("notification /?&"),
    ).resolves.toBeUndefined();
    expect(client.patch).toHaveBeenLastCalledWith(
      "notifications/notification%20%2F%3F%26/read",
    );
    await expect(notificationsApi.readAll()).resolves.toBeUndefined();
    expect(client.patch).toHaveBeenLastCalledWith("notifications/read-all");
    await notificationsApi.read("id", "mock-only-marker");
    expect(client.patch).toHaveBeenLastCalledWith("notifications/id/read");
    await notificationsApi.readAll("mock-only-marker");
    expect(client.patch).toHaveBeenLastCalledWith("notifications/read-all");
    expect(client.post).not.toHaveBeenCalled();
  });

  it("maps unreadCount, including zero, and retains existing preference requests", async () => {
    client.get
      .mockResolvedValueOnce({ unreadCount: 8 })
      .mockResolvedValueOnce({ unreadCount: 0 })
      .mockResolvedValueOnce(DEFAULT_NOTIFICATION_PREFERENCES);
    expect(await notificationsApi.unreadCount()).toEqual({ count: 8 });
    expect(client.get).toHaveBeenLastCalledWith("notifications/unread-count");
    expect(await notificationsApi.unreadCount()).toEqual({ count: 0 });
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

  it("does not substitute all events for the unsupported mentions filter", async () => {
    await expect(notificationsApi.list("mentions", 20)).rejects.toThrow(
      "Фільтр згадок поки не підтримується сервером.",
    );
    expect(client.get).not.toHaveBeenCalled();
  });

  it("propagates failures and permits retry without a mock fallback", async () => {
    const error = Object.assign(new Error("Unavailable"), { status: 404 });
    client.get
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({ items: [], nextCursor: null, hasMore: false });
    await expect(notificationsApi.list("all", 20)).rejects.toBe(error);
    await expect(notificationsApi.list("all", 20)).resolves.toEqual({
      items: [],
      nextCursor: null,
      hasMore: false,
    });
    client.patch
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(error);
    await expect(notificationsApi.readAll()).rejects.toBe(error);
    await expect(notificationsApi.readAll()).resolves.toBeUndefined();
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
