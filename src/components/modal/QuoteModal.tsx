import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { tweetApi } from "@/api";

import { useTweetComposer, useUnsavedChangesGuard } from "@/hooks";

import { Composer } from "@/components/composer";
import { ConfirmModal } from "@/components/modal/ConfirmModal";

import { getQuoteReplyingToUsernames } from "@/utils/ancestors";

import type { ComposerSubmitData, Tweet, TweetQuote } from "@/types";

interface QuoteModalProps {
  open: boolean;
  tweet: Tweet;
  repostedByMe: boolean;
  onEnsureRepost: () => Promise<boolean>;
  onClose: () => void;
}

export default function QuoteModal(props: QuoteModalProps) {
  if (!props.open) return null;

  return <QuoteModalInner key={`quote-${props.tweet.id}`} {...props} />;
}

function hasOwnContent(data: ComposerSubmitData) {
  return Boolean(
    data.content.trim() ||
    data.mediaIds.length ||
    data.poll ||
    data.location ||
    data.embed,
  );
}

function QuoteModalInner({
  open,
  tweet,
  repostedByMe,
  onEnsureRepost,
  onClose,
}: QuoteModalProps) {
  const quote: TweetQuote = {
    targetType: tweet.isComment ? "comment" : "post",
    targetId: tweet.id,
    targetVersionId: tweet.versionId,
    hasNewVersion: false,
    replyingToUsernames: tweet.isComment
      ? getQuoteReplyingToUsernames(tweet)
      : [],
    target: tweet,
  };

  const composer = useTweetComposer({
    allowEmptySubmit: true,
    onSubmit: async (data) => {
      if (!hasOwnContent(data)) {
        if (!repostedByMe && !(await onEnsureRepost())) return false;
        return true;
      }

      const created = await tweetApi.create({
        ...data,
        poll: data.poll ?? undefined,
        quotedPostId: tweet.isComment ? undefined : tweet.id,
        quotedCommentId: tweet.isComment ? tweet.id : undefined,
        quotedTargetVersionId: tweet.versionId,
      });

      window.dispatchEvent(
        new CustomEvent("tweet-created", { detail: { tweet: created } }),
      );

      return created;
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

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-modal flex items-start justify-center bg-black/40 p-0 sm:p-4 sm:pt-12"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) requestClose();
        }}
      >
        <div className="relative flex h-full w-full max-w-[600px] flex-col bg-background sm:h-auto sm:max-h-[calc(100vh-clamp(48px,8vh,100px))] sm:rounded-2xl">
          <div className="flex items-center gap-6 px-4 py-2">
            <button
              type="button"
              onClick={requestClose}
              disabled={composer.isPosting}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Закрити"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold">Quote</h2>
          </div>

          <div className="overflow-y-auto overscroll-contain px-4 pb-4">
            <Composer
              composer={composer}
              quotedTweet={quote}
              placeholder="Додайте коментар"
              submitLabel="Post"
              onSuccess={onClose}
              showAvatar
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        title="Вийти без збереження?"
        description="Ваш незавершений Quote буде втрачено."
        confirmText="Вийти"
        cancelText="Залишитися"
        onCancel={cancelDiscard}
        onConfirm={confirmDiscard}
      />
    </>,
    document.body,
  );
}
