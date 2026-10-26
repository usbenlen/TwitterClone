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
import { useTrendFeedback } from "@/hooks/useTrendFeedback";

const api = vi.hoisted(() => ({ trends: vi.fn(), feedback: vi.fn(), explore: vi.fn() }));
vi.mock("@/api/recommendations.api", () => ({
  recommendationsApi: {
    trends: api.trends,
    feedback: api.feedback,
    explore: api.explore,
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
  api.feedback.mockReset().mockResolvedValue(undefined);
  api.explore.mockReset().mockResolvedValue({ items: [topics[0]] });
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
  it("does not show an old category while switching or after its late response", async () => {
    let sports!: (value: { items: typeof topics }) => void;
    let entertainment!: (value: { items: typeof topics }) => void;
    api.explore.mockImplementation((category: string) => new Promise((resolve) => {
      if (category === "sports") sports = resolve;
      else entertainment = resolve;
    }));
    await render("/explore?tab=sports");
    await act(async () => [...host.querySelectorAll("nav button")].find((button) => button.textContent === "Розваги")!.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await act(async () => sports({ items: [topics[1]] }));
    expect(host.querySelector('section[aria-label="Розваги"] [aria-label="Завантаження тем"]')).not.toBeNull();
    expect(host.querySelector('section[aria-label="Розваги"] a')).toBeNull();
    const selected = { id: "entertainment", title: "Прем’єра", context: "Тема", query: "прем’єра" };
    await act(async () => entertainment({ items: [selected] }));
    expect(host.querySelector('section[aria-label="Розваги"] a')?.textContent).toContain("Прем’єра");
    expect(host.querySelector('section[aria-label="Розваги"]')?.textContent).not.toContain("Спорт");
  });

  it.each(["main", "aside"] as const)("restores a rejected topic everywhere and shows the error only in %s", async (surface) => {
    api.feedback.mockRejectedValueOnce(new Error("Сервер недоступний"));
    await render("/explore");
    await dismissFirst(surface);
    expect(api.feedback).toHaveBeenCalledWith({ trendId: "a", reason: "irrelevant_content" });
    expect(store.getState().trendFeedback.hidden).toEqual({});
    expect(host.querySelectorAll("main [data-actions-menu-trigger]")).toHaveLength(2);
    expect(host.querySelectorAll("aside [data-actions-menu-trigger]")).toHaveLength(2);
    expect(host.querySelector(`${surface} [role="alert"]`)?.textContent).toContain("Сервер недоступний");
    expect(host.querySelector(`${surface === "main" ? "aside" : "main"} [role="alert"]`)).toBeNull();
    await dismissFirst(surface);
    expect(api.feedback).toHaveBeenCalledTimes(2);
    expect(host.querySelector(`${surface} [role="alert"]`)).toBeNull();
    expect(store.getState().trendFeedback.hidden.a).toBe("irrelevant_content");
  });

  it("deduplicates simultaneous feedback across surfaces while allowing other topics", async () => {
    let finish!: () => void;
    api.feedback.mockReturnValue(new Promise<void>((resolve) => { finish = resolve; }));
    function Probe() {
      const main = useTrendFeedback("explore");
      const aside = useTrendFeedback("sidebar");
      return <button onClick={() => {
        main.dismissTrend("a", "spam");
        aside.dismissTrend("a", "duplicate");
        aside.dismissTrend("b", "abusive");
      }}>Send</button>;
    }
    await act(async () => root.render(<Provider store={store}><Probe /></Provider>));
    await act(async () => host.querySelector("button")!.click());
    expect(api.feedback.mock.calls).toEqual([[{ trendId: "a", reason: "spam" }], [{ trendId: "b", reason: "abusive" }]]);
    expect(Object.keys(store.getState().trendFeedback.pending)).toHaveLength(2);
    await act(async () => finish());
    expect(store.getState().trendFeedback.pending).toEqual({});
    expect(store.getState().trendFeedback.hidden).toEqual({ a: "spam", b: "abusive" });
  });

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
