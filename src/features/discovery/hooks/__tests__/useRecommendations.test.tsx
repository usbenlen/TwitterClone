import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRecommendedUsers } from "@/features/discovery/hooks/useRecommendations";

const api = vi.hoisted(() => ({ users: vi.fn() }));
vi.mock("@/features/discovery/api/recommendationQueries", () => ({
  useGetRecommendedUsersInfiniteQuery: api.users,
  useGetTrendsQuery: vi.fn()
}));
vi.mock("@/features/content/api/postQueries", () => ({
  errorMessage: (error: { message: string }) => error.message,
}));

function readRecommendations() {
  let result!: ReturnType<typeof useRecommendedUsers>;
  function Probe() {
    result = useRecommendedUsers(4);
    return null;
  }
  renderToString(<Probe />);
  return result;
}

beforeEach(() => vi.resetAllMocks());

describe("recommended author pages", () => {
  it("deduplicates authors across pages and exposes the next cursor", () => {
    const ada = { id: "u2", username: "ada", isVerified: false };
    const margaret = { id: "u4", username: "margaret", isVerified: true };
    api.users.mockReturnValue({
      data: {
        pages: [
          { items: [ada] },
          { items: [ada, margaret], nextCursor: "next" },
        ],
      },
      hasNextPage: true,
    });

    expect(readRecommendations()).toMatchObject({
      users: [ada, margaret],
      nextCursor: "next",
    });
    expect(api.users).toHaveBeenCalledWith(4);
  });

  it("does not expose a cursor when the query has no next page", () => {
    api.users.mockReturnValue({
      data: { pages: [{ items: [], nextCursor: "unused" }] },
      hasNextPage: false,
    });
    expect(readRecommendations().nextCursor).toBeNull();
  });

  it("retains loaded authors and reports a next-page failure with retry callbacks", () => {
    const author = { id: "u4", username: "margaret", isVerified: false };
    const refetch = vi.fn();
    const fetchNextPage = vi.fn();
    api.users.mockReturnValue({
      data: { pages: [{ items: [author], nextCursor: "retry" }] },
      hasNextPage: true,
      error: { message: "offline" },
      refetch,
      fetchNextPage,
    });
    expect(readRecommendations()).toMatchObject({
      users: [author],
      nextCursor: "retry",
      error: "offline",
      reload: refetch,
      loadMore: fetchNextPage,
    });
  });
});
