// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppEffects } from "@/app/providers/AppEffects";
import { createAppStore } from "@/app/store/store";
import { authCleared, authReady } from "@/features/auth/model/authState";
import { notificationsApi } from "@/features/notifications/api/notificationApi";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { appApi } from "@/shared/store/appApi";
import { sessionChanged } from "@/shared/store/session";

import type { Root } from "react-dom/client";
import type { AppStore } from "@/app/store/store";
import type { User } from "@/features/profiles/types/user";

const fixtures = vi.hoisted(() => ({
  user: { id: "viewer", username: "viewer" } as User,
  scheduled: { data: [] },
}));
vi.mock("@/shared/config/mockConfig", () => ({ MOCK_ENABLED: true }));
vi.mock("@/features/notifications/api/notificationApi", () => ({
  notificationsApi: { list: vi.fn(), unreadCount: vi.fn() },
}));
vi.mock("@/features/auth/api/authApi", () => ({
  authApi: { me: async () => fixtures.user },
}));
vi.mock("@/shared/lib/tokenStorage", () => ({ tokenStorage: { hasTokens: () => true } }));
vi.mock("@/features/profiles/api/followQueries", () => ({
  useGetFollowingQuery: () => undefined,
  useGetFollowersQuery: () => undefined
}));
vi.mock("@/features/scheduling/api/scheduleQueries", () => ({
  useGetScheduledPostsQuery: () => fixtures.scheduled
}));
vi.mock("@/features/scheduling/model/publishScheduled", () => ({ publishScheduled: vi.fn() }));

let root: Root;
let host: HTMLDivElement;
let store: AppStore;

function Inbox() {
  useNotifications("all");
  return null;
}
async function tick(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.mocked(notificationsApi.unreadCount).mockResolvedValue({ count: 3 });
  vi.mocked(notificationsApi.list).mockResolvedValue({
    items: [],
    hasMore: false,
    nextCursor: null,
    readThrough: "r",
  });
  store = createAppStore();
  store.dispatch(authReady(fixtures.user));
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => {
    root.unmount();
    store.dispatch(sessionChanged());
  });
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("authenticated notification polling", () => {
  it("polls count and open inbox, pauses out of focus and refreshes on focus/reconnect", async () => {
    await act(async () =>
      root.render(
        <Provider store={store}>
          <AppEffects />
          <Inbox />
        </Provider>,
      ),
    );
    await tick(20);
    expect(notificationsApi.unreadCount).toHaveBeenCalledTimes(1);
    expect(notificationsApi.list).toHaveBeenCalledTimes(1);
    await tick(30_000);
    expect(notificationsApi.unreadCount).toHaveBeenCalledTimes(2);
    expect(notificationsApi.list).toHaveBeenCalledTimes(2);

    await act(async () => {
      store.dispatch(appApi.internalActions.onFocusLost());
    });
    await tick(60_000);
    expect(notificationsApi.unreadCount).toHaveBeenCalledTimes(2);
    expect(notificationsApi.list).toHaveBeenCalledTimes(2);

    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });
    await tick(20);
    expect(notificationsApi.unreadCount).toHaveBeenCalledTimes(3);
    expect(notificationsApi.list).toHaveBeenCalledTimes(3);
    await act(async () => {
      window.dispatchEvent(new Event("offline"));
      window.dispatchEvent(new Event("online"));
    });
    await tick(20);
    expect(notificationsApi.unreadCount).toHaveBeenCalledTimes(4);
    expect(notificationsApi.list).toHaveBeenCalledTimes(4);
  });

  it("stops polling after logout and removes browser listeners on unmount", async () => {
    await act(async () =>
      root.render(
        <Provider store={store}>
          <AppEffects />
        </Provider>,
      ),
    );
    await tick(20);
    await act(async () => {
      store.dispatch(sessionChanged());
      store.dispatch(authCleared());
    });
    const calls = vi.mocked(notificationsApi.unreadCount).mock.calls.length;
    await tick(60_000);
    expect(notificationsApi.unreadCount).toHaveBeenCalledTimes(calls);
    await act(async () =>
      root.render(
        <Provider store={store}>
          <span />
        </Provider>,
      ),
    );
    await act(async () => {
      store.dispatch(appApi.internalActions.onFocusLost());
      window.dispatchEvent(new Event("focus"));
    });
    expect(store.getState().api.config.focused).toBe(false);
  });
});
