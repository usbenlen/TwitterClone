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
    <div className={depth === 0 ? "space-y-4" : "mt-3 space-y-3"}>
      {comments.map((comment) => {
        const isOwnComment = currentUserId === comment.author.id;
        const replies = repliesByParentId.get(comment.id) ?? [];

        return (
          <article
            key={comment.id}
            className="flex gap-3 rounded-2xl bg-muted/40 p-3"
          >
            <Avatar
              name={comment.author.displayName}
              fallbackName={comment.author.username}
              src={comment.author.avatarUrl}
              className="size-10"
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-foreground">
                      {comment.author.displayName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      @{comment.author.username}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      · {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                </div>

                {isOwnComment && (
                  <button
                    type="button"
                    onClick={() => {
                      void onDelete(comment.id);
                    }}
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-background hover:text-destructive"
                    aria-label="Видалити коментар"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground">
                {comment.content}
              </p>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => onReply(comment)}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                >
                  <MessageCircleReply className="size-4" />
                  Відповісти
                </button>
              </div>

              {replies.length > 0 && (
                <div className="mt-3 border-l border-border/80 pl-4">
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
    <div className="mt-4 border-t border-border pt-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar
          name={user?.displayName}
          fallbackName={user?.username}
          src={user?.avatarUrl}
          className="size-10"
        />

        <div className="flex-1 space-y-3">
          {replyTarget && (
            <div className="flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-3 text-sm">
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
            rows={3}
            className="min-h-24 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
          />

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {replyTarget
                ? "Відповідь буде прикріплена до обраного коментаря."
                : "Ваш коментар буде видимий під цим постом."}
            </div>

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
        <p className="mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Завантаження коментарів...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
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
    </div>
  );
}
