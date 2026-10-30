import { skipToken } from "@reduxjs/toolkit/query/react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_SEARCH_CRITERIA } from "@/features/discovery/constants/search";
import { useSearch } from "@/features/discovery/hooks/useSearch";

import type { SearchCriteria } from "@/features/discovery/types/search";

const api = vi.hoisted(() => ({ posts: vi.fn(), users: vi.fn() }));
vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));
vi.mock("@/features/profiles/hooks/useFollow", () => ({ useFollow: () => ({ following: [] }) }));
vi.mock("@/shared/hooks/useDebouncedValue", () => ({
  useDebouncedValue: (value: unknown) => value,
}));
vi.mock("@/features/content/api/postQueries", () => ({
  useGetPostsQuery: api.posts,
  useGetSearchUsersQuery: api.users,
  errorMessage: (error: { message: string }) => error.message,
}));

function renderSearch(criteria: SearchCriteria) {
  let result!: ReturnType<typeof useSearch>;
  function Probe() {
    result = useSearch(criteria);
    return null;
  }
  renderToString(<Probe />);
  return result;
}

beforeEach(() => {
  api.posts.mockReset().mockReturnValue({ currentData: [], isFetching: false });
  api.users.mockReset().mockReturnValue({ currentData: [], isFetching: false });
});

describe("active search requests", () => {
  it.each(["posts", "users"] as const)("requests only %s", (type) => {
    renderSearch({ ...DEFAULT_SEARCH_CRITERIA, query: "React", type });
    expect((type === "posts" ? api.users : api.posts).mock.calls[0][0]).toBe(
      skipToken,
    );
    expect(
      (type === "posts" ? api.posts : api.users).mock.calls[0][0],
    ).toMatchObject({ criteria: { query: "React", type } });
  });

  it("ignores loading and errors from the inactive request", () => {
    api.users.mockReturnValue({
      isFetching: true,
      error: { message: "inactive failure" },
    });
    expect(
      renderSearch({ ...DEFAULT_SEARCH_CRITERIA, query: "React" }),
    ).toMatchObject({ isLoading: false, error: null });
  });

  it("does not request an empty search", () => {
    expect(renderSearch(DEFAULT_SEARCH_CRITERIA).isLoading).toBe(false);
    expect(api.posts.mock.calls[0][0]).toBe(skipToken);
    expect(api.users.mock.calls[0][0]).toBe(skipToken);
  });
});
