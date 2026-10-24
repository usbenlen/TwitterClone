// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ExplorePage from "@/pages/explore/ExplorePage";
import RightSidebarTrendsCard from "@/components/layout/desktop/rightSidebar/RightSidebarTrendsCard";
import { createAppStore, type AppStore } from "@/store";
import { sharedApi } from "@/store/sharedApi";
import { sessionChanged } from "@/store/session";

const api = vi.hoisted(() => ({ trends: vi.fn() }));
vi.mock("@/api/recommendations.api", () => ({
  recommendationsApi: {
    trends: api.trends,
    users: async () => ({ items: [], nextCursor: null, hasMore: false }),
    posts: async () => ({ items: [], nextCursor: null, hasMore: false }),
  },
}));

const topics = [
  { id: "a", title: "Новини міста", context: "Новини", query: "topic a" },
  { id: "b", title: "Спорт", context: "Спорт", query: "topic b" },
];
let root: Root;
let host: HTMLDivElement;
let store: AppStore;

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  api.trends.mockImplementation(async (limit: number) => ({
    items: topics.slice(0, limit),
  }));
  store = createAppStore();
  await Promise.all(
    [4, 20].map((limit) =>
      store.dispatch(
        sharedApi.endpoints.getTrends.initiate(limit, { subscribe: false }),
      ),
    ),
  );
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
    store.dispatch(sessionChanged());
  });
  host.remove();
  vi.unstubAllGlobals();
});

async function render(path: string) {
  await act(async () =>
    root.render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <main>
            <ExplorePage />
          </main>
          <aside>
            <RightSidebarTrendsCard />
          </aside>
        </MemoryRouter>
      </Provider>,
    ),
  );
}

async function dismissFirst(surface: "main" | "aside") {
  const trigger = host.querySelector<HTMLButtonElement>(
    `${surface} [data-actions-menu-trigger]`,
  )!;
  await act(async () => {
    trigger.focus();
    trigger.click();
  });
  expect(document.querySelectorAll('[role="menuitem"]')).toHaveLength(6);
  await act(async () =>
    (document.querySelector('[role="menuitem"]') as HTMLButtonElement).click(),
  );
}

describe("popular topic menus across Explore and sidebar", () => {
  it.each([
    ["/explore", "main"],
    ["/explore", "aside"],
    ["/explore?tab=trending", "main"],
  ] as const)(
    "dismisses from %s in %s and synchronizes all visible lists",
    async (path, surface) => {
      await render(path);
      expect(
        host.querySelectorAll("main [data-actions-menu-trigger]"),
      ).toHaveLength(2);
      expect(
        host.querySelectorAll("aside [data-actions-menu-trigger]"),
      ).toHaveLength(2);
      await dismissFirst(surface);
      expect(store.getState().trendFeedback.hidden.a).toBe(
        "irrelevant_content",
      );
      expect(
        host.querySelectorAll("main [data-actions-menu-trigger]"),
      ).toHaveLength(1);
      expect(
        host.querySelectorAll("aside [data-actions-menu-trigger]"),
      ).toHaveLength(1);
      expect(
        [...host.querySelectorAll("a")].some(
          (link) => new URL(link.href).searchParams.get("q") === "topic a",
        ),
      ).toBe(false);
      expect(document.activeElement).toBe(
        host.querySelector(`${surface} [data-actions-menu-trigger]`),
      );
    },
  );

  it("returns focus to the overview tab when its popular list becomes empty", async () => {
    await render("/explore");
    await dismissFirst("main");
    await dismissFirst("main");
    expect(document.activeElement).toBe(
      host.querySelector(
        'nav[aria-label="Розділи огляду"] [aria-pressed="true"]',
      ),
    );
  });

  it("keeps focus in the sidebar when its last topic is dismissed", async () => {
    await render("/explore");
    await dismissFirst("aside");
    await dismissFirst("aside");
    expect(document.activeElement).toBe(
      host.querySelector('aside div[tabindex="-1"]'),
    );
  });
});
