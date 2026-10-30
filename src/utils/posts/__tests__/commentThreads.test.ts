import { describe, expect, it } from "vitest";

import type { Post } from "@/types/post";

import {
  buildThreadRows,
  getChildrenByParent,
} from "@/utils/posts/commentThreads";

function comment(
  id: string,
  authorId: string,
  parentCommentId: string | null,
): Post {
  return { id, author: { id: authorId }, parentCommentId } as Post;
}

describe("comment thread presentation", () => {
  const root = comment("root", "reader", null);
  const authorReply = comment("author-reply", "author", root.id);
  const continuation = comment("continuation", "reader", authorReply.id);
  const outsider = comment("outsider", "someone-else", authorReply.id);

  it("groups direct replies in input order and immediately shows the author's reply", () => {
    const children = getChildrenByParent([
      root,
      authorReply,
      continuation,
      outsider,
    ]);
    expect(children.get(null)).toEqual([root]);
    expect(children.get(authorReply.id)).toEqual([continuation, outsider]);
    expect(buildThreadRows(root, "author", children, new Set())).toEqual([
      { type: "comment", comment: root },
      { type: "comment", comment: authorReply },
      { type: "show-replies", parentId: authorReply.id },
    ]);
  });

  it("expands continuations for the thread participants without including other readers", () => {
    const children = getChildrenByParent([
      root,
      authorReply,
      continuation,
      outsider,
    ]);
    expect(
      buildThreadRows(root, "author", children, new Set([authorReply.id])),
    ).toEqual([
      { type: "comment", comment: root },
      { type: "comment", comment: authorReply },
      { type: "comment", comment: continuation },
    ]);
  });

  it("does not repeat comments or recurse forever if the data contains a cycle", () => {
    const children = getChildrenByParent([root, authorReply, continuation]);
    children.set(continuation.id, [authorReply]);
    const rows = buildThreadRows(
      root,
      "author",
      children,
      new Set([authorReply.id, continuation.id]),
    );
    expect(
      rows.filter((row) => row.type === "comment").map((row) => row.comment.id),
    ).toEqual([root.id, authorReply.id, continuation.id]);
  });
});
