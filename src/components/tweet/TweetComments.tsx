import { useMemo, useState } from "react";

import { useTweetComposer } from "@/hooks/composer";

import { Composer } from "@/components/composer";
import { TweetCard } from "@/components/tweet";

import { cn } from "@/utils/cn";

import type { Tweet, ComposerSubmitData } from "@/types";

interface TweetCommentsProps {
  comments: Tweet[];

  isLoading: boolean;
  isSubmitting: boolean;

  error?: string | null;

  replyingToUsername: string;
  parentCommentId: string | null;
  threadAuthorId: string;

  onSubmit: (
    data: ComposerSubmitData,
    parentCommentId?: string | null,
  ) => Promise<boolean>;

  onDelete: (commentId: string) => Promise<void>;

  onUpdate: (
    commentId: string,
    data: ComposerSubmitData | string,
  ) => Promise<boolean>;

  onOpenReplyModal: (comment: Tweet) => void;
}

type CommentThreadRow =
  | { type: "comment"; comment: Tweet }
  | { type: "show-replies"; parentId: string };

function getChildrenByParent(comments: Tweet[]) {
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

function buildThreadRows(
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

export default function TweetComments({
  comments,
  isLoading,
  error,
  replyingToUsername,
  parentCommentId,
  threadAuthorId,
  onSubmit,
  onDelete,
  onUpdate,
  onOpenReplyModal,
}: TweetCommentsProps) {
  const [expandedParentIds, setExpandedParentIds] = useState<Set<string>>(
    () => new Set(),
  );

  const composer = useTweetComposer({
    onSubmit: async (data) => {
      return onSubmit(data, null);
    },
  });

  const commentThreads = useMemo(() => {
    const childrenByParent = getChildrenByParent(comments);
    const directComments = childrenByParent.get(parentCommentId) ?? [];

    return directComments.map((comment) => ({
      id: comment.id,
      rows: buildThreadRows(
        comment,
        threadAuthorId,
        childrenByParent,
        expandedParentIds,
      ),
    }));
  }, [comments, expandedParentIds, parentCommentId, threadAuthorId]);

  return (
    <>
      <section className="border-b border-border">
        <div className="px-4 py-3">
          <Composer
            composer={composer}
            placeholder="Post your reply"
            submitLabel="Reply"
            showAvatar
            variant="comment"
            replyingToUsername={replyingToUsername}
          />

          {error && (
            <p className="my-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      </section>

      {/* Comments */}
      {isLoading ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          Завантаження коментарів...
        </p>
      ) : commentThreads.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
          Поки що немає коментарів. Будьте першим.
        </p>
      ) : (
        <div>
          {commentThreads.map((thread) => (
            <div key={thread.id}>
              {thread.rows.map((row, index) => {
                const connectsToNext = index < thread.rows.length - 1;
                const nextRow = thread.rows[index + 1];

                if (row.type === "show-replies") {
                  return (
                    <div
                      key={`show-${row.parentId}`}
                      className="grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 border-b border-border px-4 pb-3"
                    >
                      <div className="flex justify-center">
                        <div
                          className="mt-1 flex h-5 flex-col items-center justify-between"
                          aria-hidden="true"
                        >
                          <span className="size-0.5 rounded-full bg-muted-foreground/30" />
                          <span className="size-0.5 rounded-full bg-muted-foreground/30" />
                          <span className="size-0.5 rounded-full bg-muted-foreground/30" />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="cursor-pointer w-fit text-sm text-primary hover:underline"
                        onClick={() =>
                          setExpandedParentIds((current) => {
                            const next = new Set(current);
                            next.add(row.parentId);
                            return next;
                          })
                        }
                      >
                        Show replies
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={row.comment.id} className="relative">
                    {connectsToNext && (
                      <div
                        className={cn(
                          "pointer-events-none absolute left-[35px] top-[59px] z-thread w-0.5 rounded-full bg-[color-mix(in_oklab,var(--border)_95%,black)]",
                          nextRow?.type === "show-replies"
                            ? "bottom-0"
                            : "bottom-[-9px]",
                        )}
                      />
                    )}

                    <TweetCard
                      tweet={row.comment}
                      variant="feed"
                      navigateToPost
                      onOpenReplyModal={onOpenReplyModal}
                      onDelete={onDelete}
                      onUpdate={onUpdate}
                      className={connectsToNext ? "relative border-b-0" : undefined}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
