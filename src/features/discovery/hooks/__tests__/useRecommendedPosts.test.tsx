import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useRecommendedPosts } from "@/features/discovery/hooks/useRecommendedPosts";

const query = vi.hoisted(() => ({ posts: vi.fn() }));
vi.mock("@/features/content/api/postQueries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/content/api/postQueries")>();
  return { ...actual, useGetRecommendedPostsInfiniteQuery: query.posts };
});

describe("recommended post pages", () => {
  it("deduplicates by target type and ID while retaining loaded data on errors", () => {
    const post = { id: "same", content: "post" };
    const comment = { id: "same", isComment: true, content: "comment" };
    const loadMore = vi.fn();
    query.posts.mockReturnValue({
      data: { pages: [{ items: [post] }, { items: [post, comment] }] },
      hasNextPage: true,
      isFetchingNextPage: false,
      error: { message: "offline" },
      fetchNextPage: loadMore,
    });
    let result!: ReturnType<typeof useRecommendedPosts>;
    function Probe() {
      result = useRecommendedPosts();
      return null;
    }
    renderToString(<Probe />);
    expect(result.posts).toEqual([post, comment]);
    expect(result.error).toBe("offline");
    expect(result.hasMore).toBe(true);
    expect(result.loadMore).toBe(loadMore);
  });
});
