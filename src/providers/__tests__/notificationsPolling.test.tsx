// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notificationsApi } from "@/api/notifications.api";
import { useNotifications } from "@/hooks/useNotifications";
import { AppEffects } from "@/providers/AppEffects";
import { createAppStore, type AppStore } from "@/store";
import { authCleared, authReady } from "@/store/auth";
import { appApi } from "@/store/api";
import { sessionChanged } from "@/store/session";
import type { User } from "@/types/user";

const fixtures = vi.hoisted(() => ({
  user: { id: "viewer", username: "viewer" } as User,
  scheduled: { data: [] },
}));
vi.mock("@/mock/config", () => ({ MOCK_ENABLED: true }));
vi.mock("@/api/notifications.api", () => ({
  notificationsApi: { list: vi.fn(), unreadCount: vi.fn() },
}));
vi.mock("@/api/auth.api", () => ({
  authApi: { me: async () => fixtures.user },
}));
vi.mock("@/utils/storage", () => ({ tokenStorage: { hasTokens: () => true } }));
vi.mock("@/store/sharedApi", () => ({
  useGetFollowingQuery: () => undefined,
  useGetFollowersQuery: () => undefined,
  useGetScheduledPostsQuery: () => fixtures.scheduled,
}));
vi.mock("@/store/publishScheduled", () => ({ publishScheduled: vi.fn() }));

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
