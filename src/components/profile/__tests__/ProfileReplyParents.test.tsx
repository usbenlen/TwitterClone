// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { expect, it, vi } from "vitest";

import { apiClient, ApiError } from "@/api/client";
import { userApi } from "@/api/user.api";
import type { BackendPost } from "@/api/mappers/post.mapper";
import FeedList from "@/components/feed/FeedList";
import { createAppStore } from "@/store";
import { postsApi } from "@/store/postsApi";
import { sessionChanged } from "@/store/session";

vi.mock("@/mock/config", () => ({ MOCK_ENABLED: false }));

const post: BackendPost = {
  id: "shared",
  versionId: "v1",
  content: "Root post",
  author: { id: "u1", username: "alice", isVerified: false },
  likesCount: 0,
  commentsCount: 0,
  repostsCount: 0,
  viewsCount: 0,
  isLikedByCurrentUser: false,
  createdAt: "2026-10-09T10:00:00Z",
};

const page = (items: BackendPost[]) => ({
  items,
  nextCursor: null,
  hasMore: false,
});

it("loads immediate parents by type and ID and keeps replies with missing parents visible", async () => {
  const replies = page([
    { ...post, id: "direct-1", content: "First direct reply", postId: post.id },
    {
      ...post,
      id: "direct-2",
      content: "Second direct reply",
      postId: post.id,
    },
    {
      ...post,
      id: "nested",
      content: "Nested reply",
      postId: post.id,
      parentCommentId: post.id,
    },
    {
      ...post,
      id: "orphan",
      content: "Visible orphan",
      postId: post.id,
      parentCommentId: "missing",
    },
  ]);
  const get = vi.spyOn(apiClient, "get").mockImplementation(async (path) => {
    switch (path) {
      case "users/alice/replies":
        return replies;
      case "posts/shared":
        return post;
      case "comments/shared/thread":
        return {
          post,
          ancestors: [],
          target: {
            ...post,
            content: "Parent comment",
            postId: "root-of-parent",
          },
          replies: page([]),
        };
      case "comments/missing/thread":
        throw new ApiError(404, "Missing");
      default:
        throw new Error(`Unexpected path: ${path}`);
    }
  });
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const store = createAppStore();
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);

  try {
    const tweets = await userApi.getReplies("alice");
    await act(async () =>
      root.render(
        <Provider store={store}>
          <MemoryRouter>
            <FeedList tweets={tweets} variant="replies" />
          </MemoryRouter>
        </Provider>,
      ),
    );
    await act(async () => {
      await Promise.all(store.dispatch(postsApi.util.getRunningQueriesThunk()));
    });

    const cards = Array.from(host.querySelectorAll("article"));
    expect(cards).toHaveLength(7);
    [
      "Root post",
      "First direct reply",
      "Root post",
      "Second direct reply",
      "Parent comment",
      "Nested reply",
      "Visible orphan",
    ].forEach((content, index) => {
      expect(cards[index].textContent).toContain(content);
    });
    expect(host.querySelectorAll(".z-thread")).toHaveLength(3);
    expect(get.mock.calls.map(([path]) => path).sort()).toEqual([
      "comments/missing/thread",
      "comments/shared/thread",
      "posts/shared",
      "users/alice/replies",
    ]);
  } finally {
    await act(async () => {
      root.unmount();
      store.dispatch(sessionChanged());
    });
    host.remove();
    get.mockRestore();
    vi.unstubAllGlobals();
  }
});
