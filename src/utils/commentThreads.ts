import type { Tweet } from "@/types";

export type CommentThreadRow =
  | { type: "comment"; comment: Tweet }
  | { type: "show-replies"; parentId: string };

export function getChildrenByParent(comments: Tweet[]) {
  const childrenByParent = new Map<string | null, Tweet[]>();

  for (const comment of comments) {
    const parentId = comment.parentCommentId ?? null;
    const children = childrenByParent.get(parentId) ?? [];

    children.push(comment);
    childrenByParent.set(parentId, children);
  }

  return childrenByParent;
}

function appendContinuationRows(
  rows: CommentThreadRow[],
  parent: Tweet,
  participantIds: Set<string>,
  childrenByParent: Map<string | null, Tweet[]>,
  expandedParentIds: Set<string>,
  visitedIds: Set<string>,
) {
  const replies = (childrenByParent.get(parent.id) ?? []).filter((reply) =>
    participantIds.has(reply.author.id),
  );

  if (replies.length === 0) return;

  if (!expandedParentIds.has(parent.id)) {
    rows.push({ type: "show-replies", parentId: parent.id });
    return;
  }

  for (const reply of replies) {
    if (visitedIds.has(reply.id)) continue;

    visitedIds.add(reply.id);
    rows.push({ type: "comment", comment: reply });
    appendContinuationRows(
      rows,
      reply,
      participantIds,
      childrenByParent,
      expandedParentIds,
      visitedIds,
    );
  }
}

export function buildThreadRows(
  comment: Tweet,
  threadAuthorId: string,
  childrenByParent: Map<string | null, Tweet[]>,
  expandedParentIds: Set<string>,
): CommentThreadRow[] {
  const rows: CommentThreadRow[] = [{ type: "comment", comment }];
  const participantIds = new Set([threadAuthorId, comment.author.id]);
  const visitedIds = new Set([comment.id]);
  const authorReplies = (childrenByParent.get(comment.id) ?? []).filter(
    (reply) => reply.author.id === threadAuthorId,
  );

  for (const reply of authorReplies) {
    if (visitedIds.has(reply.id)) continue;

    visitedIds.add(reply.id);
    rows.push({ type: "comment", comment: reply });
    appendContinuationRows(
      rows,
      reply,
      participantIds,
      childrenByParent,
      expandedParentIds,
      visitedIds,
    );
  }

  return rows;
}
