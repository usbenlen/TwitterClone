import { renderToString } from "react-dom/server";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProfile } from "@/hooks/useProfile";
import type { User } from "@/types";

const api = vi.hoisted(() => ({ posts: vi.fn(), profile: vi.fn() }));

vi.mock("@/store/postsApi", () => ({
  useGetPostsQuery: api.posts,
  errorMessage: (error: { message: string }) => error.message,
}));

vi.mock("@/store/sharedApi", () => ({
  useGetProfileQuery: api.profile,
}));

const profile: User = {
  id: "u1",
  username: "CanonicalName",
  displayName: "Canonical name",
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  isFollowedByCurrentUser: false,
  isVerified: false,
  createdAt: "2026-01-01T00:00:00Z",
};

function renderProfile(username: string | undefined) {
  let result!: ReturnType<typeof useProfile>;

  function Probe() {
    result = useProfile(username, "posts");
    return null;
  }

  renderToString(<Probe />);
  return result;
}

beforeEach(() => {
  api.posts.mockReset().mockReturnValue({
    currentData: [],
    isFetching: false,
  });
  api.profile.mockReset().mockReturnValue({
    currentData: profile,
    isFetching: false,
  });
});

describe("profile rendering state", () => {
  it("renders the current query data when the API canonicalizes the username", () => {
    expect(renderProfile("canonicalname")).toMatchObject({
      user: profile,
      isLoading: false,
      notFound: false,
    });
    expect(api.posts).toHaveBeenCalledWith({
      kind: "profile",
      username: "CanonicalName",
      tab: "posts",
    });
  });

  it("keeps the loading state only while the profile request is active", () => {
    api.profile.mockReturnValue({
      currentData: undefined,
      isFetching: true,
    });

    expect(renderProfile("pending-user")).toMatchObject({
      user: null,
      isLoading: true,
      notFound: false,
    });
    expect(api.posts).toHaveBeenCalledWith(skipToken);
  });

  it("keeps cached profile data visible when a background refetch fails", () => {
    api.profile.mockReturnValue({
      currentData: profile,
      isFetching: false,
      error: { message: "offline" },
    });

    expect(renderProfile("CanonicalName")).toMatchObject({
      user: profile,
      isLoading: false,
      notFound: false,
    });
  });
});
