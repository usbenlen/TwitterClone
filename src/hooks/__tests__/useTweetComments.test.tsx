import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTweetComments } from "@/hooks/useTweetComments";

import type { ComposerSubmitData } from "@/types";

const api = vi.hoisted(() => ({
  create: vi.fn(),
  unwrap: vi.fn(),
  reset: vi.fn(),
  postsQuery: { currentData: undefined as unknown },
}));

vi.mock("@/store/postsApi", () => ({
  errorMessage: () => "Request failed",
  useGetPostsQuery: () => api.postsQuery,
  useCreateCommentMutation: () => [
    api.create,
    { isLoading: false, reset: api.reset },
  ],
  useUpdatePostMutation: () => [vi.fn(), { reset: api.reset }],
  useDeletePostMutation: () => [vi.fn(), { reset: api.reset }],
}));

function renderComments(parentCommentId: string | null) {
  let result!: ReturnType<typeof useTweetComments>;
  function Probe() {
    result = useTweetComments({
      postId: "post-1",
      parentCommentId,
      initialCount: 3,
    });
    return null;
  }
  renderToString(<Probe />);
  return result;
}

const data: ComposerSubmitData = { content: "A reply", mediaIds: [] };
beforeEach(() => {
  api.postsQuery.currentData = undefined;
  api.unwrap.mockReset().mockResolvedValue({ id: "new-comment" });
  api.create.mockReset().mockReturnValue({ unwrap: api.unwrap });
});

describe("comment request targeting", () => {
  it.each([
    [null, undefined, null],
    ["comment-1", undefined, "comment-1"],
    ["comment-1", null, null],
    [null, "comment-1", "comment-1"],
    ["comment-1", "nested-comment", "nested-comment"],
  ] as const)(
    "context %s and explicit target %s submit parent %s",
    async (context, target, expected) => {
      expect(await renderComments(context).createComment(data, target)).toBe(
        true,
      );
      expect(api.create).toHaveBeenCalledWith(
        expect.objectContaining({
          postId: "post-1",
          parentCommentId: expected,
          content: "A reply",
        }),
      );
    },
  );

  it("reports failure without changing the count or input data", async () => {
    api.unwrap.mockRejectedValue(new Error("offline"));
    const hook = renderComments(null);
    expect(await hook.createComment(data)).toBe(false);
    expect(hook.commentsCount).toBe(3);
    expect(data.content).toBe("A reply");
  });

  it("preserves the server reply count when loaded comments omit nested replies", () => {
    api.postsQuery.currentData = [];

    expect(renderComments("comment-1").commentsCount).toBe(3);
  });
});
