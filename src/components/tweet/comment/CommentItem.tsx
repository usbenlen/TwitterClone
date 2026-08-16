import { BadgeCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { useCommentActions } from "@/hooks";

import { Avatar, TwemojiText } from "@/ui";

import { ActionsMenu, TweetActions } from "@/components/tweet";
import { EditModal } from "@/components/modal";

import { APP_ROUTES } from "@/constants/routes";
import { formatRelativeTime } from "@/utils/format";

import type { Comment } from "@/types/comment";

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  repliesByParentId: Map<string, Comment[]>;
  currentUserId?: string;
  depth?: number;

  onUpdate: (commentId: string, content: string) => Promise<boolean>;

  onReply: (comment: Comment) => void;
  onDelete: (commentId: string) => Promise<void>;
}

export default function CommentItem({
  comment,
  replies,
  repliesByParentId,
  currentUserId,
  depth = 0,
  onReply,
  onDelete,
  onUpdate,
}: CommentItemProps) {
  const actions = useCommentActions(comment);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const displayName = comment.author.displayName?.trim() || comment.author.username;

  const isOwnComment = currentUserId === comment.author.id;

  return (
    <article
      className={
        depth === 0 ? "px-4 py-3" : "border-l border-border/80 pl-4 py-2"
      }
    >
      <div className="grid grid-cols-[40px_minmax(0,1fr)] gap-3">
        {/* Avatar + thread line */}
        <div className="flex flex-col items-center">
          <Avatar
            name={displayName}
            fallbackName={comment.author.username}
            src={comment.author.avatarUrl}
            className="size-10 shrink-0"
          />

          {replies.length > 0 && <div className="mt-2 w-px flex-1" />}
        </div>

        <div className="relative min-w-0">
          {/* Header */}
          <div className="relative pr-8">
            <div className="flex min-w-0 flex-wrap items-center gap-x-1">
              <Link
                to={APP_ROUTES.profile(comment.author.username)}
                onClick={(event) => {
                  event.stopPropagation();
                }}
                className="truncate text-sm font-bold text-foreground hover:underline"
              >
                {displayName}
              </Link>

              {comment.author.isVerified && (
                <BadgeCheck
                  size={18}
                  className="shrink-0 text-background"
                  fill="#1d9bf0"
                />
              )}

              <span className="truncate text-sm text-muted-foreground">
                @{comment.author.username}
              </span>

              <span className="text-sm text-muted-foreground">
                · {formatRelativeTime(comment.createdAt)}
              </span>

              {comment.updatedAt && (
                <>
                  <span className="text-sm text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground italic">
                    Відредаговано
                  </span>
                </>
              )}
            </div>

            {/* Three dots - тільки для власного коментаря */}
            {isOwnComment && (
              <div className="absolute right-0 top-0">
                <ActionsMenu
                  onDelete={() => {
                    void onDelete(comment.id);
                  }}
                  onEdit={() => setIsEditModalOpen(true)}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="text-[15px] leading-6 text-foreground wrap-break-word whitespace-pre-wrap">
            <TwemojiText text={comment.content} />
          </div>

          {/* Повний TweetActions */}
          <TweetActions
            likedByMe={actions.likedByMe}
            likesCount={actions.likesCount}
            repostedByMe={actions.repostedByMe}
            repliesCount={actions.repliesCount}
            retweetsCount={actions.repostsCount}
            viewsCount={actions.viewsCount}
            bookmarkedByMe={actions.bookmarkedByMe}
            onComment={() => {
              onReply(comment);
            }}
            onRepost={() => {
              void actions.toggleRepost();
            }}
            onLike={() => {
              void actions.toggleLike();
            }}
            onBookmark={() => {
              void actions.toggleBookmark();
            }}
          />

          {/* Nested replies */}
          {replies.length > 0 && (
            <div className="mt-2 space-y-1">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  replies={repliesByParentId.get(reply.id) ?? []}
                  repliesByParentId={repliesByParentId}
                  currentUserId={currentUserId}
                  depth={depth + 1}
                  onReply={onReply}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EditModal
        open={isEditModalOpen}
        title="Редагувати коментар"
        initialContent={comment.content}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async (content) => {
          await onUpdate(comment.id, content);
        }}
      />
    </article>
  );
}
