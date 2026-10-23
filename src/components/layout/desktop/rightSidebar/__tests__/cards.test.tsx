import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RightSidebarTrendsCard from "@/components/layout/desktop/rightSidebar/RightSidebarTrendsCard";
import RightSidebarSuggestedUsers from "@/components/layout/desktop/rightSidebar/RightSidebarSuggestedUsers";

const hooks = vi.hoisted(() => ({ trends: vi.fn(), users: vi.fn() }));
vi.mock("@/hooks", () => ({
  useTrends: hooks.trends,
  useRecommendedUsers: hooks.users,
}));
vi.mock("@/components/user/index", () => ({
  RecommendationUserItem: ({ user }: { user: { username: string } }) => (
    <p>@{user.username}</p>
  ),
}));

const empty = { isLoading: false, error: null, reload: vi.fn() };

beforeEach(() => {
  hooks.trends.mockReturnValue({ ...empty, trends: [] });
  hooks.users.mockReturnValue({ ...empty, users: [] });
});

function renderCards() {
  return renderToStaticMarkup(
    <MemoryRouter>
      <RightSidebarTrendsCard />
      <RightSidebarSuggestedUsers />
    </MemoryRouter>,
  );
}

describe("right sidebar cards", () => {
  it("keeps both empty cards visible without a show-more link", () => {
    const html = renderCards();
    expect(html).toContain("Популярне");
    expect(html).toContain("Кого читати");
    expect(html.match(/Ще немає/g)).toHaveLength(2);
    expect(html).not.toContain("Показати більше");
  });

  it("shows loading indicators instead of an empty message during requests", () => {
    hooks.trends.mockReturnValue({ ...empty, trends: [], isLoading: true });
    hooks.users.mockReturnValue({ ...empty, users: [], isLoading: true });
    const html = renderCards();
    expect(html).toContain("Завантаження тем");
    expect(html).toContain("Завантаження рекомендацій");
    expect(html).not.toContain("Ще немає");
    expect(html).not.toContain("Показати більше");
  });

  it("keeps failures and retry controls visible instead of treating them as empty", () => {
    hooks.trends.mockReturnValue({
      ...empty,
      trends: [],
      error: "Помилка трендів",
    });
    hooks.users.mockReturnValue({
      ...empty,
      users: [],
      error: "Помилка рекомендацій",
    });
    const html = renderCards();
    expect(html).toContain("Помилка трендів");
    expect(html).toContain("Помилка рекомендацій");
    expect(html.match(/Спробувати ще раз/g)).toHaveLength(2);
    expect(html).not.toContain("Ще немає");
    expect(html).not.toContain("Показати більше");
  });

  it("renders returned trends and recommended users with navigation", () => {
    hooks.trends.mockReturnValue({
      ...empty,
      trends: [
        { id: "t1", title: "#Київ", context: "Україна", query: "#Київ" },
      ],
    });
    hooks.users.mockReturnValue({
      ...empty,
      users: [{ id: "u1", username: "alice" }],
    });
    const html = renderCards();
    expect(html).toContain("#Київ");
    expect(html).toContain("@alice");
    expect(html).toContain('href="/follow"');
    expect(html).toContain('href="/follow?tab=trends"');
    expect(html.match(/Показати більше/g)).toHaveLength(2);
    expect(html).not.toContain("Ще немає");
  });
});
