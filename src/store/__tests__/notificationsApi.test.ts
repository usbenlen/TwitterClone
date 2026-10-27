import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notificationsApi } from "@/api/notifications.api";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/constants/notifications";
import { createAppStore, type AppStore } from "@/store";
import { appApi } from "@/store/api";
import { notificationsQueryApi } from "@/store/notificationsApi";
import { sessionChanged } from "@/store/session";
import { postsApi } from "@/store/postsApi";
import { commentApi } from "@/api/comment.api";
import type { NotificationsPage } from "@/types/notification";

vi.mock("@/mock/config", () => ({ MOCK_ENABLED: true }));
vi.mock("@/api/notifications.api", () => ({
  notificationsApi: {
    list: vi.fn(),
    unreadCount: vi.fn(),
    read: vi.fn(),
    readAll: vi.fn(),
    preferences: vi.fn(),
    updatePreferences: vi.fn(),
  },
}));
vi.mock("@/api/comment.api", () => ({ commentApi: { getThread: vi.fn() } }));

const endpoints = notificationsQueryApi.endpoints;
const emptyPage: NotificationsPage = {
  items: [],
  hasMore: false,
  nextCursor: null,
  readThrough: "snapshot",
};
let store: AppStore;

beforeEach(() => {
  vi.resetAllMocks();
  store = createAppStore();
  vi.mocked(notificationsApi.list).mockResolvedValue(emptyPage);
  vi.mocked(notificationsApi.unreadCount).mockResolvedValue({ count: 1 });
  vi.mocked(notificationsApi.preferences).mockResolvedValue(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );
});
afterEach(() => {
  store.dispatch(sessionChanged());
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
async function settleQueries() {
  await Promise.all(store.dispatch(appApi.util.getRunningQueriesThunk()));
}

describe("notification cache and sessions", () => {
  it("keeps tab pages independent and uses the returned opaque cursor", async () => {
    vi.mocked(notificationsApi.list)
      .mockResolvedValueOnce({
        ...emptyPage,
        hasMore: true,
        nextCursor: "opaque+/=?",
      })
      .mockResolvedValue(emptyPage);
    await store.dispatch(endpoints.getNotifications.initiate("all"));
    await store.dispatch(endpoints.getNotifications.initiate("mentions"));
    await store.dispatch(
      endpoints.getNotifications.initiate("all", { direction: "forward" }),
    );
    expect(notificationsApi.list).toHaveBeenNthCalledWith(
      3,
      "all",
      20,
      "opaque+/=?",
    );
    expect(
      endpoints.getNotifications.select("all")(store.getState()).data?.pages,
    ).toHaveLength(2);
    expect(
      endpoints.getNotifications.select("mentions")(store.getState()).data
        ?.pages,
    ).toHaveLength(1);
  });

  it("refreshes both tabs and the counter after a successful read", async () => {
    await store.dispatch(endpoints.getNotifications.initiate("all"));
    await store.dispatch(endpoints.getNotifications.initiate("mentions"));
    await store.dispatch(endpoints.getUnreadNotificationsCount.initiate());
    vi.mocked(notificationsApi.read).mockResolvedValue(undefined);
    vi.mocked(notificationsApi.unreadCount).mockResolvedValue({ count: 0 });
    await store.dispatch(
      endpoints.markNotificationRead.initiate({
        id: "n1",
        readThrough: "snapshot",
      }),
    );
    await settleQueries();
    expect(notificationsApi.list).toHaveBeenCalledTimes(4);
    expect(
      endpoints.getUnreadNotificationsCount.select()(store.getState()).data,
    ).toEqual({ count: 0 });
  });

  it("retains state on failed read/settings writes and allows retry", async () => {
    await store.dispatch(endpoints.getUnreadNotificationsCount.initiate());
    await store.dispatch(endpoints.getNotificationPreferences.initiate());
    vi.mocked(notificationsApi.readAll)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    vi.mocked(notificationsApi.updatePreferences).mockRejectedValueOnce(
      new Error("offline"),
    );
    await expect(
      store
        .dispatch(endpoints.markAllNotificationsRead.initiate("snapshot"))
        .unwrap(),
    ).rejects.toMatchObject({ message: "offline" });
    await expect(
      store
        .dispatch(
          endpoints.updateNotificationPreferences.initiate({ likes: false }),
        )
        .unwrap(),
    ).rejects.toMatchObject({ message: "offline" });
    expect(
      endpoints.getUnreadNotificationsCount.select()(store.getState()).data
        ?.count,
    ).toBe(1);
    expect(
      endpoints.getNotificationPreferences.select()(store.getState()).data
        ?.likes,
    ).toBe(true);
    await store
      .dispatch(endpoints.markAllNotificationsRead.initiate("snapshot"))
      .unwrap();
    await settleQueries();
  });

  it("does not populate a new session with old pages, counts or preferences", async () => {
    const page = deferred<NotificationsPage>();
    const count = deferred<{ count: number }>();
    const prefs = deferred<typeof DEFAULT_NOTIFICATION_PREFERENCES>();
    vi.mocked(notificationsApi.list).mockReturnValueOnce(page.promise);
    vi.mocked(notificationsApi.unreadCount).mockReturnValueOnce(count.promise);
    vi.mocked(notificationsApi.preferences).mockReturnValueOnce(prefs.promise);
    const old = [
      store.dispatch(endpoints.getNotifications.initiate("all")),
      store.dispatch(endpoints.getUnreadNotificationsCount.initiate()),
      store.dispatch(endpoints.getNotificationPreferences.initiate()),
    ];
    store.dispatch(sessionChanged());
    await store.dispatch(endpoints.getNotifications.initiate("all"));
    await store.dispatch(endpoints.getUnreadNotificationsCount.initiate());
    page.resolve({ ...emptyPage, readThrough: "old-session" });
    count.resolve({ count: 999 });
    prefs.resolve({ ...DEFAULT_NOTIFICATION_PREFERENCES, likes: false });
    await Promise.all(old);
    expect(
      endpoints.getNotifications.select("all")(store.getState()).data?.pages[0]
        .readThrough,
    ).toBe("snapshot");
    expect(
      endpoints.getUnreadNotificationsCount.select()(store.getState()).data
        ?.count,
    ).toBe(1);
    expect(
      endpoints.getNotificationPreferences.select()(store.getState()).data,
    ).toBeUndefined();
  });

  it("clears pending mutation results and ignores their late completion after logout", async () => {
    const pending = deferred<void>();
    vi.mocked(notificationsApi.read).mockReturnValueOnce(pending.promise);
    const old = store.dispatch(
      endpoints.markNotificationRead.initiate(
        { id: "n1", readThrough: "r" },
        { fixedCacheKey: "notifications:read" },
      ),
    );
    store.dispatch(sessionChanged());
    pending.resolve();
    await old;
    expect(
      endpoints.markNotificationRead.select({
        requestId: undefined,
        fixedCacheKey: "notifications:read",
      })(store.getState()).isUninitialized,
    ).toBe(true);
  });

  it("keeps comment and post threads with identical IDs in distinct caches", async () => {
    vi.mocked(commentApi.getThread).mockImplementation(async (id, type) => ({
      ancestors: [],
      replies: [],
      target: { id, isComment: type === "comment" } as never,
    }));
    await store.dispatch(
      postsApi.endpoints.getThread.initiate({ id: "same", type: "post" }),
    );
    await store.dispatch(
      postsApi.endpoints.getThread.initiate({ id: "same", type: "comment" }),
    );
    expect(
      postsApi.endpoints.getThread.select({ id: "same", type: "post" })(
        store.getState(),
      ).data?.target.isComment,
    ).toBe(false);
    expect(
      postsApi.endpoints.getThread.select({ id: "same", type: "comment" })(
        store.getState(),
      ).data?.target.isComment,
    ).toBe(true);
    expect(commentApi.getThread).toHaveBeenCalledWith("same", "comment");
  });
});
