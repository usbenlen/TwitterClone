import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useNavigation } from "@/widgets/navigation/useNavigation";

import type { User } from "@/features/profiles/types/user";

const state = vi.hoisted(() => ({ user: null as User | null }));

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ user: state.user }),
}));

const user: User = {
  id: "u1",
  username: "viewer",
  role: "User",
  isVerified: false,
  isFollowedByCurrentUser: false,
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  createdAt: "2026-01-01",
};

function DesktopNavigation() {
  return (
    <nav>
      {useNavigation().map((item) => (
        <a href={item.to} key={item.label}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

beforeEach(() => {
  state.user = null;
});

describe("navigation role access", () => {
  it("shows the admin panel for the Admin role", () => {
    state.user = { ...user, role: "Admin" };

    const html = renderToStaticMarkup(<DesktopNavigation />);

    expect(html).toContain('href="/admin"');
    expect(html).toContain("Адмін-панель");
  });

  it("does not show the admin panel for the User role", () => {
    state.user = user;

    const html = renderToStaticMarkup(<DesktopNavigation />);

    expect(html).not.toContain('href="/admin"');
    expect(html).not.toContain("Адмін-панель");
  });
});
