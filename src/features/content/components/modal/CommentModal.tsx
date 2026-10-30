import { X } from "lucide-react";
import { createPortal } from "react-dom";

import Composer from "@/features/content/components/composer/Composer";
import { usePostComposer } from "@/features/content/hooks/composer/usePostComposer";
import { getReplyingToUsernames } from "@/features/content/lib/posts/ancestors";
import { useBodyScrollLock, useUnsavedChangesGuard } from "@/shared/hooks";
import {
  normalizeDisplayText,
  normalizeInlineDisplayText,
} from "@/shared/lib/displayText";
import { Avatar, ConfirmModal, TwemojiText } from "@/shared/ui";

import type { ComposerSubmitData, Post } from "@/features/content/types";

interface CommentModalProps {
  open: boolean;
  post: Post;
  replyTo?: Post | null;
  onClose: () => void;
  onSubmit: (
    content: ComposerSubmitData,
    parentCommentId?: string | null,
  ) => Promise<boolean>;
  isSubmitting: boolean;
}

export default function CommentModal(props: CommentModalProps) {
  const { open, post, replyTo } = props;

  if (!open) return null;

  return (
    <CommentModalInner
      key={`comment-modal-${replyTo?.id || post.id}`}
      {...props}
    />
  );
}

function CommentModalInner({
  open,
  post,
  replyTo,
  onClose,
  onSubmit,
}: CommentModalProps) {
  const displayedPost = replyTo ?? post;
  const composer = usePostComposer({
    onSubmit: async (data) => {
      return onSubmit(
        data,
        displayedPost.isComment ? displayedPost.id : null,
      );
    },
  });

  const { isConfirmOpen, requestClose, cancelDiscard, confirmDiscard } =
    useUnsavedChangesGuard({
      hasChanges: composer.hasChanges,
      isBusy: composer.isPosting,
      onClose,
    });

  useBodyScrollLock(open);

  const authorName = normalizeInlineDisplayText(displayedPost.author.displayName || displayedPost.author.username);
  const replyingToUsernames = getReplyingToUsernames(post, replyTo);

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-modal flex items-start justify-center modal-backdrop p-0 sm:p-4 sm:pt-12"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) requestClose();
        }}
      >
        <div className="relative flex h-full w-full max-w-[600px] flex-col overflow-y-auto overscroll-contain bg-background sm:h-auto sm:max-h-[calc(100vh-clamp(48px,8vh,100px))] sm:rounded-2xl dark:sm:inset-ring dark:sm:inset-ring-control-border">
          <div className="flex items-center px-4 py-2">
            <button
              type="button"
              onClick={requestClose}
              className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted dark:hover:bg-surface-hover dark:active:bg-muted dark:focus-visible:focus-indicator"
              aria-label="Закрити"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 pb-4">
            <div className="relative grid grid-cols-[44px_1fr] gap-3">
              <div className="flex flex-col items-center">
                <Avatar
                  userId={displayedPost.author.id}
                  fallbackName={displayedPost.author.username}
                  name={displayedPost.author.displayName}
                  src={displayedPost.author.avatarUrl}
                  className="size-11 shrink-0"
                />

                <div className="pointer-events-none absolute left-[22px] top-[47px] bottom-[-13px] z-thread w-0.5 -translate-x-1/2 rounded-full bg-[color-mix(in_oklab,var(--border)_95%,black)]" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[15px]">
                  <span className="truncate font-bold">{authorName}</span>
                  <span className="truncate text-muted-foreground">
                    @{normalizeInlineDisplayText(displayedPost.author.username)}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(displayedPost.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-1 min-w-0 overflow-hidden wrap-anywhere whitespace-pre-wrap text-[15px] leading-normal">
                  <TwemojiText text={normalizeDisplayText(displayedPost.content)} />
                </div>

                {replyingToUsernames.length > 0 && (
                  <p className="mt-3 text-[15px] text-muted-foreground">
                    Replying to{" "}
                    {replyingToUsernames.map((username, index) => (
                      <span key={username}>
                        {index > 0 &&
                          (index === replyingToUsernames.length - 1
                            ? " and "
                            : " ")}

                        <span className="inline-block max-w-full cursor-pointer overflow-hidden align-bottom wrap-anywhere text-primary hover:underline">
                          @{normalizeInlineDisplayText(username)}
                        </span>
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <Composer
                composer={composer}
                placeholder="Post your reply"
                submitLabel="Reply"
                onSuccess={onClose}
                showAvatar={true}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        title="Вийти без збереження?"
        description="У вас є незавершена відповідь. Якщо вийти зараз, введені зміни будуть втрачені."
        confirmText="Вийти"
        cancelText="Залишитися"
        onCancel={cancelDiscard}
        onConfirm={confirmDiscard}
      />
    </>,
    document.body,
  );
}
