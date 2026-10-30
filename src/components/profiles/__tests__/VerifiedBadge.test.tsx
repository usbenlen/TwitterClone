import { Provider } from "react-redux";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { authReady } from "@/store/authState";
import { createAppStore } from "@/store/store";
import { VerifiedBadge } from "@/components/profiles/VerifiedBadge";

import type { User } from "@/types/user";

function renderBadge(
  user: Pick<User, "id" | "role" | "isVerified">,
  sessionUser?: User,
  size = 24,
) {
  const store = createAppStore();
  if (sessionUser) store.dispatch(authReady(sessionUser));

  return renderToStaticMarkup(
    <Provider store={store}>
      <VerifiedBadge user={user} size={size} />
    </Provider>,
  );
}

describe("verification badges", () => {
  it.each([false, true])(
    "shows a gray admin badge when isVerified=%s",
    (isVerified) => {
      const html = renderBadge(
        { id: "admin", role: "Admin", isVerified },
        undefined,
        18,
      );

      expect(html.match(/<svg/g)).toHaveLength(1);
      expect(html).toContain('fill="#8899a6"');
      expect(html).not.toContain('fill="#1d9bf0"');
      expect(html).toContain('aria-label="Адміністратор"');
      expect(html).toContain('role="img"');
      expect(html).toContain('aria-hidden="false"');
      expect(html).toContain('width="18"');
    },
  );

  it.each(["User", undefined] satisfies User["role"][])(
    "keeps ordinary verification blue when role=%s",
    (role) => {
      expect(renderBadge({ id: "user", role, isVerified: true })).toContain(
        'fill="#1d9bf0"',
      );
      expect(renderBadge({ id: "user", role, isVerified: true })).toContain(
        'aria-label="Верифікований профіль"',
      );
    },
  );

  it.each(["User", undefined] satisfies User["role"][])(
    "does not show a badge for an unverified user when role=%s",
    (role) => {
      expect(renderBadge({ id: "user", role, isVerified: false })).toBe("");
    },
  );

  it("uses the session role when a profile response has a stale role", () => {
    const sessionAdmin: User = {
      id: "u1",
      username: "admin",
      role: "Admin",
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isFollowedByCurrentUser: false,
      isVerified: true,
      createdAt: "2026-01-01T00:00:00Z",
    };

    const html = renderBadge(
      { id: "u1", role: "User", isVerified: true },
      sessionAdmin,
    );

    expect(html).toContain('fill="#8899a6"');
    expect(html).not.toContain('fill="#1d9bf0"');
  });
});
