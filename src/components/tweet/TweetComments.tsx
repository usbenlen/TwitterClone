/** @format */

import { useMemo, useState } from "react";
import { MessageCircleReply, Trash2, X } from "lucide-react";

import { Avatar, Button } from "@/ui";

import { formatRelativeTime } from "@/utils/format";

import { useAuth } from "@/hooks/useAuth";

import type { Comment } from "@/types/comment";

interface TweetCommentsProps {
  comments: Comment[];
  isLoading: boolean;
  isSubmitting: boolean;
  error?: string | null;
  onSubmit: (
    content: string,
    parentCommentId?: string | null,
  ) => Promise<boolean>;
  onDelete: (commentId: string) => Promise<void>;
}

interface CommentListProps {
  comments: Comment[];
  repliesByParentId: Map<string, Comment[]>;
  currentUserId?: string;
  onReply: (comment: Comment) => void;
  onDelete: (commentId: string) => Promise<void>;
  depth?: number;
}

function groupReplies(comments: Comment[]) {
  const commentIds = new Set(comments.map((comment) => comment.id));
  const roots: Comment[] = [];
  const repliesByParentId = new Map<string, Comment[]>();

  for (const comment of comments) {
    const parentId = comment.parentCommentId;

    if (!parentId || !commentIds.has(parentId)) {
      roots.push(comment);
      continue;
    }

    const currentReplies = repliesByParentId.get(parentId) ?? [];
    currentReplies.push(comment);
    repliesByParentId.set(parentId, currentReplies);
  }

  return {
    roots,
    repliesByParentId,
  };
}

function CommentList({
  comments,
  repliesByParentId,
  currentUserId,
  onReply,
  onDelete,
  depth = 0,
}: CommentListProps) {
  return (
    <div className={depth === 0 ? "divide-y divide-border" : "space-y-3"}>
      {comments.map((comment) => {
        const isOwnComment = currentUserId === comment.author.id;
        const replies = repliesByParentId.get(comment.id) ?? [];
        const displayName =
          comment.author.displayName?.trim() || comment.author.username;

        return (
          <article
            key={comment.id}
            className={depth === 0 ? "py-4 first:pt-0 last:pb-0" : ""}
          >
            <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-3">
              <div className="flex flex-col items-center">
                <Avatar
                  name={displayName}
                  fallbackName={comment.author.username}
                  src={comment.author.avatarUrl}
                  className="size-9"
                />

                {replies.length > 0 && (
                  <div className="mt-2 w-px flex-1 bg-border" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="truncate font-semibold text-foreground">
                        {displayName}
                      </span>

                      <span className="truncate text-sm text-muted-foreground">
                        @{comment.author.username}
                      </span>

                      <span className="text-sm text-muted-foreground">
                        · {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-6 text-foreground">
                      {comment.content}
                    </p>
                  </div>

                  {isOwnComment && (
                    <button
                      type="button"
                      onClick={() => {
                        void onDelete(comment.id);
                      }}
                      className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Видалити коментар"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onReply(comment)}
                  className="mt-2 inline-flex items-center gap-2 rounded-full py-1 pr-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
                >
                  <MessageCircleReply className="size-4" />
                  Відповісти
                </button>

                {replies.length > 0 && (
                  <div className="mt-3">
                    <CommentList
                      comments={replies}
                      repliesByParentId={repliesByParentId}
                      currentUserId={currentUserId}
                      onReply={onReply}
                      onDelete={onDelete}
                      depth={depth + 1}
                    />
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function TweetComments({
  comments,
  isLoading,
  isSubmitting,
  error,
  onSubmit,
  onDelete,
}: TweetCommentsProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);

  const { roots, repliesByParentId } = useMemo(
    () => groupReplies(comments),
    [comments],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedContent = content.trim();

    if (!normalizedContent) return;

    const created = await onSubmit(
      normalizedContent,
      replyTarget?.id ?? null,
    );

    if (created) {
      setContent("");
      setReplyTarget(null);
    }
  };

  return (
    <section
      className="mt-4 border-t border-border pt-4"
      data-tweet-interactive="true"
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-[40px_1fr] gap-3">
        <Avatar
          name={user?.displayName}
          fallbackName={user?.username}
          src={user?.avatarUrl}
          className="size-10"
        />

        <div className="min-w-0">
          {replyTarget && (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-2 text-sm">
              <span className="min-w-0 truncate text-muted-foreground">
                Відповідь для{" "}
                <span className="font-semibold text-foreground">
                  @{replyTarget.author.username}
                </span>
              </span>

              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                aria-label="Скасувати відповідь"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={
              replyTarget
                ? `Ваша відповідь для @${replyTarget.author.username}...`
                : "Напишіть коментар..."
            }
            rows={2}
            className="min-h-20 w-full resize-none border-0 bg-transparent py-2 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
          />

          <div className="flex items-center justify-end border-t border-border pt-3">
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              disabled={!content.trim()}
            >
              {replyTarget ? "Відповісти" : "Коментувати"}
            </Button>
          </div>
        </div>
      </form>

      {error && (
        <p className="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-5">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Завантаження коментарів...
          </p>
        ) : comments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            Поки що немає коментарів. Будьте першим.
          </p>
        ) : (
          <CommentList
            comments={roots}
            repliesByParentId={repliesByParentId}
            currentUserId={user?.id}
            onReply={setReplyTarget}
            onDelete={onDelete}
          />
        )}
      </div>
    </section>
  );
}
