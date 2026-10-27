// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notificationsApi } from "@/api/notifications.api";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/constants/notifications";
import { APP_ROUTES } from "@/constants/routes";
import { MAIN_NAVIGATION } from "@/constants/navigation";
import NotificationsPage from "@/pages/notifications/NotificationsPage";
import NotificationSettingsPage from "@/pages/notifications/NotificationSettingsPage";
import { createAppStore, type AppStore } from "@/store";
import { notificationsQueryApi } from "@/store/notificationsApi";
import { sessionChanged } from "@/store/session";
import type { ChirpNotification } from "@/types/notification";

vi.mock("@/mock/config", () => ({ MOCK_ENABLED: true }));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "viewer" } }),
}));
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

const notification: ChirpNotification = {
  id: "group1",
  type: "like",
  actors: [
    { id: "ada", username: "ada", displayName: "Ada", isVerified: false },
  ],
  actorCount: 4,
  target: { id: "same", type: "comment", preview: "Ваш коментар" },
  createdAt: "2026-10-27T12:00:00Z",
  updatedAt: "2026-10-27T12:00:00Z",
  isRead: false,
  isMention: false,
};
let store: AppStore;
let root: Root;
let host: HTMLDivElement;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.resetAllMocks();
  store = createAppStore();
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  vi.mocked(notificationsApi.list).mockImplementation(async (tab) => ({
    items: tab === "all" ? [notification] : [],
    nextCursor: null,
    hasMore: false,
    readThrough: "observed",
  }));
  vi.mocked(notificationsApi.preferences).mockResolvedValue(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );
  vi.mocked(notificationsApi.read).mockResolvedValue(undefined);
  vi.mocked(notificationsApi.readAll).mockResolvedValue(undefined);
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

function Probe() {
  const route = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-route>
        {route.pathname}
        {route.search}
      </output>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
}
async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
  });
}
async function render(path = "/notifications") {
  await act(async () =>
    root.render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/home", path]}>
          <Routes>
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route
              path="/settings/notifications"
              element={<NotificationSettingsPage />}
            />
            <Route path="/post/:postId" element={<p>Thread</p>} />
            <Route path="/ada" element={<p>Profile</p>} />
          </Routes>
          <Probe />
        </MemoryRouter>
      </Provider>,
    ),
  );
  await flush();
}
function button(text: string) {
  return [...host.querySelectorAll("button")].find(
    (node) => node.textContent?.trim() === text,
  )!;
}

describe("notification pages", () => {
  it("shows groups, unread labels, settings and does not read on page entry", async () => {
    await render();
    expect(host.querySelector("h1")?.textContent).toBe("Сповіщення");
    expect(host.textContent).toContain("та ще 3");
    expect(
      host.querySelector('article[aria-label="Непрочитане сповіщення"]'),
    ).not.toBeNull();
    expect(
      host.querySelector(`a[href="${APP_ROUTES.SETTINGS_NOTIFICATIONS}"]`),
    ).not.toBeNull();
    expect(notificationsApi.readAll).not.toHaveBeenCalled();
    expect(notificationsApi.read).not.toHaveBeenCalled();
  });

  it("switches URL-backed tabs and renders the mentions empty state", async () => {
    await render();
    await act(async () =>
      host
        .querySelector<HTMLAnchorElement>(
          'a[href="/notifications?tab=mentions"]',
        )!
        .click(),
    );
    await flush();
    expect(host.querySelector("[data-route]")?.textContent).toBe(
      "/notifications?tab=mentions",
    );
    expect(host.textContent).toContain("Вас поки не згадували");
    expect(host.querySelector('a[aria-current="page"]')?.textContent).toBe(
      "Згадки",
    );
    expect(host.querySelector("article")).toBeNull();
  });

  it("reads a row and navigates with an explicit comment type", async () => {
    await render();
    const link = host.querySelector<HTMLAnchorElement>(
      'a[href="/post/same?targetType=comment"]',
    )!;
    link.focus();
    expect(document.activeElement).toBe(link);
    await act(async () => link.click());
    expect(notificationsApi.read).toHaveBeenCalledWith("group1", "observed");
    expect(host.querySelector("[data-route]")?.textContent).toBe(
      "/post/same?targetType=comment",
    );
  });

  it("keeps navigation working on read failure and shows the failure on return", async () => {
    vi.mocked(notificationsApi.read).mockRejectedValue(new Error("offline"));
    await render();
    await act(async () =>
      host
        .querySelector<HTMLAnchorElement>(
          'a[href="/post/same?targetType=comment"]',
        )!
        .click(),
    );
    await flush();
    await act(async () => button("Back").click());
    await flush();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      "offline",
    );
    expect(
      host.querySelector('article[aria-label="Непрочитане сповіщення"]'),
    ).not.toBeNull();
  });

  it("reads all tabs only through the observed marker", async () => {
    await render("/notifications?tab=mentions");
    await act(async () =>
      host
        .querySelector<HTMLButtonElement>(
          'button[aria-label="Позначити всі прочитаними"]',
        )!
        .click(),
    );
    expect(notificationsApi.readAll).toHaveBeenCalledWith("observed");
  });

  it("uses tooltips for header actions on hover and keyboard focus, without native titles", async () => {
    await render();
    const readAll = host.querySelector<HTMLButtonElement>(
      'button[aria-label="Позначити всі прочитаними"]',
    )!;
    const settings = host.querySelector<HTMLAnchorElement>(
      'a[aria-label="Налаштування сповіщень"]',
    )!;
    expect(readAll.hasAttribute("title")).toBe(false);
    expect(settings.hasAttribute("title")).toBe(false);

    vi.useFakeTimers();
    await act(async () => {
      readAll.dispatchEvent(
        new PointerEvent("pointerover", {
          pointerType: "mouse",
          bubbles: true,
        }),
      );
      readAll.dispatchEvent(new MouseEvent("mouseenter"));
    });
    await act(async () => {
      vi.advanceTimersByTime(449);
    });
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(
      "Позначити всі прочитаними",
    );
    expect(readAll.getAttribute("aria-describedby")).toBe(
      document.querySelector('[role="tooltip"]')?.id,
    );
    await act(async () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      readAll.dispatchEvent(
        new MouseEvent("mouseleave", { relatedTarget: document.body }),
      );
    });
    expect(document.querySelector('[role="tooltip"]')).toBeNull();

    await act(async () => settings.focus());
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(
      "Налаштування сповіщень",
    );
    await act(async () => settings.click());
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(host.querySelector("[data-route]")?.textContent).toBe(
      APP_ROUTES.SETTINGS_NOTIFICATIONS,
    );
  });

  it("shows a loading state and permits retrying an initial failure", async () => {
    let fail!: (error: Error) => void;
    vi.mocked(notificationsApi.list).mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        fail = reject;
      }),
    );
    await render();
    expect(
      host.querySelector('[aria-label="Завантаження сповіщень"]'),
    ).not.toBeNull();
    await act(async () => fail(new Error("Unavailable")));
    await flush();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      "Unavailable",
    );
    await act(async () => button("Спробувати ще раз").click());
    await flush();
    expect(host.querySelector("article")).not.toBeNull();
  });

  it("retains edited preferences after a failed save and saves on retry", async () => {
    let preferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };
    vi.mocked(notificationsApi.preferences).mockImplementation(
      async () => preferences,
    );
    vi.mocked(notificationsApi.updatePreferences)
      .mockRejectedValueOnce(new Error("offline"))
      .mockImplementation(async (patch) => {
        preferences = { ...preferences, ...patch };
        return preferences;
      });
    await render("/settings/notifications");
    const switches = host.querySelectorAll<HTMLInputElement>(
      'input[role="switch"]',
    );
    expect(switches).toHaveLength(6);
    expect(button("Зберегти").disabled).toBe(true);
    await act(async () => switches[0].click());
    expect(switches[0].checked).toBe(false);
    await act(async () => button("Зберегти").click());
    await flush();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      "offline",
    );
    expect(switches[0].checked).toBe(false);
    await act(async () => button("Зберегти").click());
    await flush();
    expect(notificationsApi.updatePreferences).toHaveBeenLastCalledWith({
      likes: false,
    });
    expect(host.querySelector('[role="status"]')?.textContent).toContain(
      "Налаштування збережено",
    );
    expect(button("Зберегти").disabled).toBe(true);
  });

  it("retains loaded rows when the next page fails and retries the same cursor", async () => {
    const rows = Array.from({ length: 22 }, (_, index) => ({
      ...notification,
      id: `row-${index}`,
      type: "reply" as const,
    }));
    vi.mocked(notificationsApi.list)
      .mockResolvedValueOnce({
        items: rows.slice(0, 20),
        nextCursor: "next-page",
        hasMore: true,
        readThrough: "observed",
      })
      .mockRejectedValueOnce(new Error("page offline"))
      .mockResolvedValueOnce({
        items: rows.slice(20),
        nextCursor: null,
        hasMore: false,
        readThrough: "observed",
      });
    await render();
    await act(async () => button("Показати ще").click());
    await flush();
    expect(host.querySelectorAll("article")).toHaveLength(20);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      "page offline",
    );
    await act(async () => button("Спробувати ще раз").click());
    await flush();
    expect(notificationsApi.list).toHaveBeenLastCalledWith(
      "all",
      20,
      "next-page",
    );
    expect(host.querySelectorAll("article")).toHaveLength(22);
    expect(button("Показати ще")).toBeUndefined();
  });

  it("provides notification navigation on mobile and desktop", () => {
    expect(
      MAIN_NAVIGATION.find(
        (item) => item.getPath() === APP_ROUTES.NOTIFICATIONS,
      )?.mobilePlacement,
    ).toEqual(["bottom", "more"]);
  });

  it.each([
    [0, null],
    [1, "1"],
    [99, "99"],
    [100, "99+"],
    [1000, "99+"],
  ] as const)(
    "displays unread count %i as %s without losing the accessible count",
    async (count, badge) => {
      vi.mocked(notificationsApi.unreadCount).mockResolvedValue({ count });
      await store.dispatch(
        notificationsQueryApi.endpoints.getUnreadNotificationsCount.initiate(),
      );
      await act(async () =>
        root.render(
          <Provider store={store}>
            <NotificationBell />
          </Provider>,
        ),
      );
      expect(
        host.querySelector('span[aria-hidden="true"]')?.textContent ?? null,
      ).toBe(badge);
      if (count > 0)
        expect(host.textContent).toContain(`Непрочитаних сповіщень: ${count}`);
      else expect(host.textContent).not.toContain("Непрочитаних сповіщень");
    },
  );
});
