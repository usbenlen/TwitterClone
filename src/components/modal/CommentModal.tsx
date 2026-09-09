import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { useTweetComposer, useUnsavedChangesGuard } from "@/hooks";

import { Composer } from "@/components/composer";
import { ConfirmModal } from "@/components/modal/ConfirmModal";

import { Avatar, TwemojiText } from "@/ui";

import { getReplyingToUsernames } from "@/utils/ancestors";

import type { ComposerSubmitData, Tweet } from "@/types";

interface CommentModalProps {
  open: boolean;
  tweet: Tweet;
  replyTo?: Tweet | null;
  onClose: () => void;
  onSubmit: (
    content: ComposerSubmitData,
    parentCommentId?: string | null,
  ) => Promise<boolean>;
  isSubmitting: boolean;
}

export default function CommentModal(props: CommentModalProps) {
  const { open, tweet, replyTo } = props;

  if (!open) return null;

  return (
    <CommentModalInner
      key={`comment-modal-${replyTo?.id || tweet.id}`}
      {...props}
    />
  );
}

function CommentModalInner({
  open,
  tweet,
  replyTo,
  onClose,
  onSubmit,
}: CommentModalProps) {
  const composer = useTweetComposer({
    onSubmit: async (data) => {
      return onSubmit(data, replyTo?.id || null);
    },
  });

  const { isConfirmOpen, requestClose, cancelDiscard, confirmDiscard } =
    useUnsavedChangesGuard({
      hasChanges: composer.hasChanges,
      isBusy: composer.isPosting,
      onClose,
    });

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const displayedTweet = replyTo ?? tweet;
  const authorName = displayedTweet.author.displayName || displayedTweet.author.username;
  const replyingToUsernames = getReplyingToUsernames(tweet, replyTo);

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-modal flex items-start justify-center bg-black/40 p-0 sm:p-4 sm:pt-12"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) requestClose();
        }}
      >
        <div className="relative flex h-full w-full max-w-[600px] flex-col overflow-y-auto overscroll-contain bg-background sm:h-auto sm:max-h-[calc(100vh-clamp(48px,8vh,100px))] sm:rounded-2xl">
          <div className="flex items-center px-4 py-2">
            <button
              type="button"
              onClick={requestClose}
              className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
              aria-label="Закрити"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 pb-4">
            <div className="relative grid grid-cols-[44px_1fr] gap-3">
              <div className="flex flex-col items-center">
                <Avatar
                  name={displayedTweet.author.displayName}
                  src={displayedTweet.author.avatarUrl}
                  className="size-11 shrink-0"
                />

                <div className="pointer-events-none absolute left-[22px] top-[47px] bottom-[-13px] z-thread w-0.5 -translate-x-1/2 rounded-full bg-[color-mix(in_oklab,var(--border)_95%,black)]" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[15px]">
                  <span className="truncate font-bold">{authorName}</span>
                  <span className="truncate text-muted-foreground">
                    @{displayedTweet.author.username}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(displayedTweet.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-1 text-[15px] leading-normal">
                  <TwemojiText text={displayedTweet.content} />
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

                        <span className="cursor-pointer text-primary hover:underline">
                          @{username}
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
