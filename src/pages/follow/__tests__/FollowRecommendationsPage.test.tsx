// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import FollowRecommendationsPage from "@/pages/follow/FollowRecommendationsPage";

import { APP_ROUTES, RECOMMENDATIONS_PAGE_LIMIT } from "@/constants";

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
      <MemoryRouter initialEntries={["/home", path]}>
        <Routes>
          <Route path="/follow" element={<FollowRecommendationsPage />} />
          <Route path="/explore" element={<p>Explore</p>} />
          <Route path="/home" element={<p>Home</p>} />
        </Routes>
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
    "supports %s as an author-only page",
    async (path) => {
      await render(path);
      expect(host.querySelector("h1")?.textContent).toBe("Рекомендації");
      expect(host.querySelector('nav[aria-label="Рекомендації"]')).toBeNull();
      expect(host.textContent).not.toContain("Популярне");
      expect(host.querySelector('a[href="/ada"]')).not.toBeNull();
      expect(hooks.users).toHaveBeenCalledWith(RECOMMENDATIONS_PAGE_LIMIT);
      expect(APP_ROUTES.followRecommendations()).toBe("/follow");
    },
  );

  it("redirects the legacy trends URL, preserves parameters and replaces the history entry", async () => {
    await render("/follow?tab=trends&source=sidebar");
    expect(host.querySelector("[data-route]")?.textContent).toBe(
      "/explore?tab=trending&source=sidebar",
    );
    expect(hooks.users).not.toHaveBeenCalled();
    expect(hooks.trends).not.toHaveBeenCalled();
    await act(async () => button("Back").click());
    expect(host.querySelector("[data-route]")?.textContent).toBe("/home");
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
