// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { MemoryRouter, useLocation, useNavigate } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ExplorePage from "@/pages/explore/ExplorePage";
import { createAppStore } from "@/store/store";

const hooks = vi.hoisted(() => ({
  trends: vi.fn(),
  categories: vi.fn(),
  users: vi.fn(),
  posts: vi.fn(),
}));
vi.mock("@/hooks/recommendations/useRecommendations", () => ({
  useTrends: hooks.trends,
  useExploreTrends: hooks.categories,
  useRecommendedUsers: hooks.users,
}));
vi.mock("@/hooks/recommendations/useRecommendedPosts", () => ({
  useRecommendedPosts: hooks.posts,
}));
vi.mock("@/components/profiles/RecommendationUserItem", () => ({
  default: ({ user }: { user: { username: string } }) => (
    <a href={`/${user.username}`}>{user.username}</a>
  )
}));
vi.mock("@/components/posts/FeedList", () => ({
  default: ({ posts }: { posts: { id: string; content: string }[] }) => (
    <div>
      {posts.map((post) => (
        <p key={post.id}>{post.content}</p>
      ))}
    </div>
  ),
}));

const trends = [
  {
    id: "n",
    title: "Новини економіки",
    context: "Суспільство",
    query: "новини & економіка",
    postsCount: 42,
  },
  { id: "s", title: "Футбол", context: "Спорт", query: "футбол" },
  { id: "e", title: "Music", context: "Entertainment", query: "music" },
  { id: "t", title: "React", context: "Технології", query: "react" },
];
const reload = vi.fn();
const reloadUsers = vi.fn();
const loadMore = vi.fn();
let host: HTMLDivElement;
let root: Root;

function RouteProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output data-route>
        {location.pathname}
        {location.search}
      </output>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  hooks.trends.mockReturnValue({
    trends,
    isLoading: false,
    error: null,
    reload,
  });
  hooks.categories.mockImplementation((category: string) => ({
    trends: trends.filter((trend) => trend.id === ({ news: "n", sports: "s", entertainment: "e" })[category]),
    isLoading: false,
    error: null,
    reload,
  }));
  hooks.users.mockReturnValue({
    users: [{ id: "u1", username: "ada" }],
    isLoading: false,
    error: null,
    reload: reloadUsers,
  });
  hooks.posts.mockReturnValue({
    posts: [{ id: "p1", content: "Recommended post" }],
    isLoading: false,
    isLoadingMore: false,
    hasMore: true,
    error: null,
    reload: vi.fn(),
    loadMore,
    retry: vi.fn(),
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

async function render(path = "/explore") {
  await act(async () =>
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Provider store={createAppStore()}>
          <ExplorePage />
        </Provider>
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

describe("Explore page", () => {
  it("keeps popular topics visible when the independent news request fails", async () => {
    hooks.categories.mockReturnValue({ trends: [], isLoading: false, error: "News offline", reload });
    await render();
    expect(host.querySelector('[role="alert"]')?.textContent).toBe("News offline");
    expect(host.querySelectorAll('[data-actions-menu-trigger]')).toHaveLength(trends.length);
    expect(host.textContent).toContain("Recommended post");
  });

  it("renders a server-selected topic whose title has no category keywords", async () => {
    hooks.categories.mockReturnValue({ trends: [trends[3]], isLoading: false, error: null, reload });
    await render("/explore?tab=sports");
    expect(host.querySelector("section section a")?.textContent).toContain("React");
  });

  it("combines existing features and keeps the tab strip independently scrollable", async () => {
    await render();
    expect(
      host.querySelectorAll('nav[aria-label="Розділи огляду"] button'),
    ).toHaveLength(5);
    const nav = host.querySelector('nav[aria-label="Розділи огляду"]')!;
    expect(nav.classList.contains("overflow-x-auto")).toBe(true);
    expect(nav.firstElementChild?.classList.contains("flex-nowrap")).toBe(true);
    expect(host.textContent).toContain("Кого читати");
    expect(host.textContent).toContain("Recommended post");
    expect(host.querySelector('a[href="/follow"]')).not.toBeNull();
    expect(hooks.trends).toHaveBeenCalledWith(20, false);
    expect(hooks.categories).toHaveBeenCalledWith("news", 3, false);
    expect(button("Показати ще")).toBeUndefined();
    expect(loadMore).not.toHaveBeenCalled();
  });

  it.each([
    ["news", "Новини економіки"],
    ["sports", "Футбол"],
    ["entertainment", "Music"],
  ])("opens %s directly with server-selected topics", async (tab, title) => {
    await render(`/explore?tab=${tab}`);
    const links = [...host.querySelectorAll("main a, section section a")];
    expect(links).toHaveLength(1);
    expect(links[0].textContent).toContain(title);
    expect(host.textContent).not.toContain("Recommended post");
    expect(hooks.categories).toHaveBeenCalledWith(tab, 20, false);
    expect(hooks.trends).toHaveBeenCalledWith(20, true);
  });

  it("preserves URL parameters and supports browser history", async () => {
    await render("/explore?source=sidebar");
    await act(async () => button("Спорт").click());
    expect(host.querySelector("[data-route]")?.textContent).toBe(
      "/explore?source=sidebar&tab=sports",
    );
    expect(button("Спорт").getAttribute("aria-pressed")).toBe("true");
    await act(async () => button("Розваги").click());
    await act(async () => button("Back").click());
    expect(button("Спорт").getAttribute("aria-pressed")).toBe("true");
    await act(async () => button("Огляд").click());
    expect(host.querySelector("[data-route]")?.textContent).toBe(
      "/explore?source=sidebar",
    );
  });

  it("uses the topic's encoded search query and submits the existing search form", async () => {
    await render("/explore?tab=news");
    const link = host.querySelector("section section a") as HTMLAnchorElement;
    expect(new URL(link.href).searchParams.get("q")).toBe("новини & економіка");
    const input = host.querySelector("input")!;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    await act(async () => {
      setter.call(input, "  React  ");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () =>
      host
        .querySelector("form")!
        .dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
    expect(host.querySelector("[data-route]")?.textContent).toBe(
      "/search?q=React&type=posts",
    );
  });

  it("distinguishes loading, empty categories and retryable errors", async () => {
    hooks.categories.mockReturnValue({
      trends: [],
      isLoading: true,
      error: null,
      reload,
    });
    await render("/explore?tab=sports");
    expect(
      host.querySelector('[aria-label="Завантаження тем"]'),
    ).not.toBeNull();
    hooks.categories.mockReturnValue({
      trends: [],
      isLoading: false,
      error: null,
      reload,
    });
    await render("/explore?tab=sports");
    expect(host.textContent).toContain("Поки що тем у цій категорії немає.");
    hooks.categories.mockReturnValue({
      trends: [],
      isLoading: false,
      error: "offline",
      reload,
    });
    await render("/explore?tab=sports");
    expect(host.textContent).not.toContain(
      "Поки що тем у цій категорії немає.",
    );
    await act(async () => button("Спробувати ще раз").click());
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("keeps authors and loaded posts visible when another block or next page fails", async () => {
    hooks.trends.mockReturnValue({
      trends: [],
      isLoading: false,
      error: "Topics offline",
      reload,
    });
    hooks.posts.mockReturnValue({
      ...hooks.posts(),
      error: "Page offline",
      retry: loadMore,
    });
    await render();
    expect(host.querySelector('a[href="/ada"]')).not.toBeNull();
    expect(host.textContent).toContain("Recommended post");
    const retry = host.querySelector(
      'section[aria-label="Дописи для вас"] button',
    ) as HTMLButtonElement;
    await act(async () => retry.click());
    expect(loadMore).toHaveBeenCalledTimes(1);
  });
});
