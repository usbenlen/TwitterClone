import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CommentModal from "@/features/content/components/modal/CommentModal";
import { usePostComposer } from "@/features/content/hooks/composer/usePostComposer";

import type { ComposerSubmitData } from "@/features/content/types/composer";
import type { Post } from "@/features/content/types/post";

vi.mock("@/features/content/hooks/composer/usePostComposer", () => ({
  usePostComposer: vi.fn(() => ({}))
}));
vi.mock("@/shared/hooks/useUnsavedChangesGuard", () => ({
  useUnsavedChangesGuard: () => ({})
}));
vi.mock("@/features/content/components/composer/Composer", () => ({
  default: () => null
}));
vi.mock("react-dom", () => ({ createPortal: () => null }));

const post = {
  id: "post-1",
  isComment: false,
  content: "Post",
  author: { id: "user", username: "alice", displayName: "Alice" },
  createdAt: "2026-01-01T00:00:00Z",
} as Post;
const comment = { ...post, id: "comment-1", isComment: true, postId: post.id };
const nested = { ...comment, id: "comment-2", parentCommentId: comment.id };
const data: ComposerSubmitData = { content: "Reply from modal", mediaIds: [] };

beforeEach(() => vi.stubGlobal("document", { body: {} }));
afterEach(() => vi.unstubAllGlobals());

describe("CommentModal submission", () => {
  it.each([
    ["post passed as replyTo", post, post, null],
    ["post without replyTo", post, null, null],
    ["comment from the post thread", post, comment, comment.id],
    ["comment without replyTo", comment, null, comment.id],
    ["nested comment", post, nested, nested.id],
  ] as const)(
    "targets %s correctly",
    async (_name, post, replyTo, expected) => {
      const submit = vi.fn().mockResolvedValue(true);
      renderToString(
        <CommentModal
          open
          post={post}
          replyTo={replyTo}
          onSubmit={submit}
          onClose={vi.fn()}
          isSubmitting={false}
        />,
      );
      const options = vi.mocked(usePostComposer).mock.calls.at(-1)![0]!;
      expect(await options.onSubmit!(data)).toBe(true);
      expect(submit).toHaveBeenCalledWith(data, expected);
    },
  );

  it("propagates a failed submit so the composer keeps the draft and modal open", async () => {
    const submit = vi.fn().mockResolvedValue(false);
    const close = vi.fn();
    renderToString(
      <CommentModal
        open
        post={post}
        replyTo={post}
        onSubmit={submit}
        onClose={close}
        isSubmitting={false}
      />,
    );
    const options = vi.mocked(usePostComposer).mock.calls.at(-1)![0]!;
    expect(await options.onSubmit!(data)).toBe(false);
    expect(close).not.toHaveBeenCalled();
  });
});
