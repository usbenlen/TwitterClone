// @vitest-environment happy-dom
import { renderToStaticMarkup } from "react-dom/server";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { createAppStore } from "@/app/store/store";
import ProfileHeader from "@/widgets/profile/ProfileHeader";
import ProfileInfo from "@/widgets/profile/ProfileInfo";
import SearchUserResult from "@/features/discovery/components/search/SearchUserResult";
import RecommendationUserItem from "@/features/profiles/components/RecommendationUserItem";
import UserListItem from "@/features/profiles/components/UserListItem";
import { APP_ROUTES } from "@/shared/config/routes";

import type { ReactNode } from "react";
import type { User } from "@/features/profiles/types/user";

const user: User = Object.freeze({
  id: "display-user",
  username: "raw   user",
  displayName: "  Ім’я\n\n Прізвище  ",
  bio: "Перший" + " \n\t ".repeat(100) + "Другий",
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  isFollowedByCurrentUser: false,
  isVerified: false,
  createdAt: "2026-10-25T12:00:00Z",
});

function render(children: ReactNode) {
  const html = renderToStaticMarkup(
    <Provider store={createAppStore()}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>,
  );
  return new DOMParser().parseFromString(html, "text/html").body;
}

describe("profile display text", () => {
  it.each([
    ["profile", () => <ProfileInfo user={user} />],
    ["user list", () => <UserListItem user={user} />],
    ["recommendation", () => <RecommendationUserItem user={user} />],
    ["search", () => <SearchUserResult user={user} />],
  ] as const)("normalizes names and biographies in the %s", (_name, component) => {
    const body = render(component());
    expect(body.textContent).toContain("Ім’я Прізвище");
    expect(body.textContent).toContain("@raw user");
    expect(body.textContent).toContain("Перший\n\nДругий");
    expect(user.displayName).toBe("  Ім’я\n\n Прізвище  ");
    expect(user.bio).toContain(" \n\t ".repeat(100));

    if (_name !== "profile") {
      expect(body.querySelector("a")?.getAttribute("href")).toBe(
        APP_ROUTES.profile(user.username),
      );
    }
  });

  it("normalizes the profile heading and preserves the existing username fallback", () => {
    expect(render(<ProfileHeader user={user} />).querySelector("h1")?.textContent)
      .toBe("Ім’я Прізвище");
    expect(render(<ProfileHeader user={{ ...user, displayName: null }} />)
      .querySelector("h1")?.textContent).toBe("@raw user");
  });

  it("keeps ordinary text and paragraph breaks", () => {
    const ordinary = {
      ...user,
      username: "olena",
      displayName: "Олена Коваль",
      bio: "Пишу українською 👩‍💻\n\nНовий абзац.",
    };
    const body = render(<ProfileInfo user={ordinary} />);
    expect(body.querySelector("h2")?.textContent).toBe(ordinary.displayName);
    expect(body.querySelectorAll("p")[1].textContent).toBe(ordinary.bio);
  });
});
