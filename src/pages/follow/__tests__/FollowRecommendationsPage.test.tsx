// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation, useNavigate } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import FollowRecommendationsPage from "@/pages/follow/FollowRecommendationsPage";

import {
  APP_ROUTES,
  RECOMMENDATIONS_PAGE_LIMIT,
  TRENDS_PAGE_LIMIT,
} from "@/constants";

const hooks = vi.hoisted(() => ({ users: vi.fn(), trends: vi.fn() }));
vi.mock("@/hooks", () => ({
  useRecommendedUsers: hooks.users,
  useTrends: hooks.trends,
}));
vi.mock("@/components/user/index", () => ({
  RecommendationUserItem: ({ user }: { user: { username: string } }) => (
    <a href={APP_ROUTES.profile(user.username)}>@{user.username}</a>
  ),
}));

let host: HTMLDivElement;
let root: Root;
const reload = vi.fn();
const loadMore = vi.fn();
const ready = {
  users: [{ id: "u2", username: "ada" }],
  nextCursor: "next",
  isLoading: false,
  isLoadingMore: false,
  error: null,
  reload,
  loadMore,
};

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  hooks.users.mockReturnValue(ready);
  hooks.trends.mockReturnValue({
    trends: [],
    isLoading: false,
    error: null,
    reload: vi.fn(),
  });
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function RouteProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-route>
        {location.pathname}
        {location.search}
      </output>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
    </>
  );
}

async function render(path: string = APP_ROUTES.FOLLOW_RECOMMENDATIONS) {
  await act(async () =>
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <FollowRecommendationsPage />
        <RouteProbe />
      </MemoryRouter>,
    ),
  );
}

function button(text: string) {
  return [...host.querySelectorAll("button")].find(
    (node) => node.textContent?.trim() === text,
  )!;
}

describe("single recommended author page", () => {
  it.each(["/follow", "/follow?tab=people", "/follow?tab=creators"])(
    "supports %s with mobile recommendation tabs",
    async (path) => {
      await render(path);
      expect(host.querySelector("h1")?.textContent).toBe("Рекомендації");
      expect(
        host.querySelector('nav[aria-label="Рекомендації"]'),
      ).not.toBeNull();
      expect(host.textContent).toContain("Популярне");
      expect(host.querySelector('a[href="/ada"]')).not.toBeNull();
      expect(hooks.users).toHaveBeenCalledWith(RECOMMENDATIONS_PAGE_LIMIT);
      expect(APP_ROUTES.followRecommendations()).toBe("/follow");
    },
  );

  it("opens a directly linked trends tab and renders more than the sidebar limit", async () => {
    hooks.trends.mockReturnValue({
      trends: Array.from({ length: 6 }, (_, index) => ({
        id: `trend-${index}`,
        title: `Тема ${index}`,
        context: "Популярне",
        query: `topic-${index}`,
      })),
      isLoading: false,
      error: null,
      reload: vi.fn(),
    });

    await render(APP_ROUTES.followRecommendations("trends"));

    expect(hooks.trends).toHaveBeenCalledWith(TRENDS_PAGE_LIMIT);
    expect(host.querySelectorAll('[role="tabpanel"] a')).toHaveLength(6);
    expect(host.textContent).toContain("Тема 5");
    expect(host.querySelector('a[href="/ada"]')).toBeNull();
    expect(button("Популярне").getAttribute("aria-pressed")).toBe("true");
    expect(button("Показати ще")).toBeUndefined();
  });

  it("keeps tab selection in the URL, preserves other parameters and supports Back", async () => {
    await render("/follow?source=sidebar");
    await act(async () => button("Популярне").click());
    expect(host.querySelector("[data-route]")?.textContent).toBe(
      "/follow?source=sidebar&tab=trends",
    );
    expect(host.querySelector('a[href="/ada"]')).toBeNull();

    await act(async () => button("Автори").click());
    expect(host.querySelector("[data-route]")?.textContent).toBe(
      "/follow?source=sidebar",
    );
    expect(host.querySelector('a[href="/ada"]')).not.toBeNull();

    await act(async () => button("Back").click());
    expect(button("Популярне").getAttribute("aria-pressed")).toBe("true");
    expect(host.querySelector('a[href="/ada"]')).toBeNull();
  });

  it("shows an actionable retry when the trends page fails", async () => {
    const retryTrends = vi.fn();
    hooks.trends.mockReturnValue({
      trends: [],
      isLoading: false,
      error: "Не вдалося отримати теми",
      reload: retryTrends,
    });
    await render(APP_ROUTES.followRecommendations("trends"));
    expect(host.textContent).toContain("Не вдалося отримати теми");
    await act(async () => button("Спробувати ще раз").click());
    expect(retryTrends).toHaveBeenCalledTimes(1);
  });

  it("loads another page and disables the button while loading", async () => {
    await render();
    await act(async () => button("Показати ще").click());
    expect(loadMore).toHaveBeenCalledTimes(1);
    hooks.users.mockReturnValue({ ...ready, isLoadingMore: true });
    await render();
    expect(button("Показати ще").disabled).toBe(true);
  });

  it("shows a request failure with an actionable retry", async () => {
    hooks.users.mockReturnValue({
      ...ready,
      users: [],
      nextCursor: null,
      error: "offline",
    });
    await render();
    expect(host.textContent).toContain("offline");
    await act(async () => button("Спробувати ще раз").click());
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("retains loaded authors and permits retrying a failed next page", async () => {
    hooks.users.mockReturnValue({ ...ready, error: "offline" });
    await render();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      "offline",
    );
    expect(host.querySelector('a[href="/ada"]')).not.toBeNull();
    await act(async () => button("Показати ще").click());
    expect(loadMore).toHaveBeenCalledTimes(1);
  });

  it("distinguishes loading from empty results and omits load-more on the final page", async () => {
    hooks.users.mockReturnValue({
      ...ready,
      users: [],
      nextCursor: null,
      isLoading: true,
    });
    await render();
    expect(
      host.querySelector('[aria-label="Завантаження рекомендацій"]'),
    ).not.toBeNull();
    expect(host.textContent).not.toContain("Поки що рекомендацій немає.");
    hooks.users.mockReturnValue({ ...ready, users: [], nextCursor: null });
    await render();
    expect(host.textContent).toContain("Поки що рекомендацій немає.");
    expect(button("Показати ще")).toBeUndefined();
  });
});
