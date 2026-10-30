import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ProfileInfo from "@/widgets/profile/ProfileInfo";

import type { User } from "@/features/profiles/types/user";

const user: User = {
  id: "u1",
  username: "alice",
  displayName: "Alice",
  bio: "Biography",
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  isFollowedByCurrentUser: false,
  isVerified: false,
  createdAt: "2026-10-09T10:00:00Z",
};
const location = {
  id: "kyiv",
  name: "Київ",
  country: "Україна",
  latitude: 50.45,
  longitude: 30.52,
};

describe("profile location", () => {
  it("shows a location below the biography even without verification", () => {
    const html = renderToStaticMarkup(
      <ProfileInfo user={{ ...user, location }} />,
    );
    expect(html).toContain("Київ, Україна");
    expect(html.indexOf(user.bio!)).toBeLessThan(html.indexOf("Київ"));
  });

  it("shows the name without a trailing comma when the country is empty", () => {
    const html = renderToStaticMarkup(
      <ProfileInfo
        user={{ ...user, bio: null, location: { ...location, country: "" } }}
      />,
    );
    expect(html).toContain("Київ</span>");
    expect(html).not.toContain("Київ,");
  });

  it.each([null, undefined])("omits an absent location (%s)", (location) => {
    const html = renderToStaticMarkup(
      <ProfileInfo user={{ ...user, location }} />,
    );
    expect(html).not.toContain("lucide-map-pin");
    expect(html).toContain(user.bio!);
  });
});
