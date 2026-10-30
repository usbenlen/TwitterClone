import { X } from "lucide-react";
import { createPortal } from "react-dom";

import { useCreatePostMutation } from "@/features/content/api/postQueries";
import Composer from "@/features/content/components/composer/Composer";
import { usePostComposer } from "@/features/content/hooks/composer/usePostComposer";
import { getQuoteReplyingToUsernames } from "@/features/content/lib/posts/ancestors";
import { useBodyScrollLock, useUnsavedChangesGuard } from "@/shared/hooks";
import { ConfirmModal } from "@/shared/ui";

import type {
  ComposerSubmitData,
  Post,
  PostQuote,
} from "@/features/content/types";

interface QuoteModalProps {
  open: boolean;
  post: Post;
  repostedByMe: boolean;
  onEnsureRepost: () => Promise<boolean>;
  onClose: () => void;
}

export default function QuoteModal(props: QuoteModalProps) {
  if (!props.open) return null;

  return <QuoteModalInner key={`quote-${props.post.id}`} {...props} />;
}

function hasOwnContent(data: ComposerSubmitData) {
  return Boolean(
    data.content.trim() ||
    data.mediaIds.length ||
    data.poll ||
    data.location ||
    data.linkPreview,
  );
}

function QuoteModalInner({
  open,
  post,
  repostedByMe,
  onEnsureRepost,
  onClose,
}: QuoteModalProps) {
  const [createPost] = useCreatePostMutation();
  const quote: PostQuote = {
    targetType: post.isComment ? "comment" : "post",
    targetId: post.id,
    targetVersionId: post.versionId,
    hasNewVersion: false,
    replyingToUsernames: post.isComment
      ? getQuoteReplyingToUsernames(post)
      : [],
    target: post,
  };

  const composer = usePostComposer({
    allowEmptySubmit: true,
    onSubmit: async (data) => {
      if (!hasOwnContent(data)) {
        if (!repostedByMe && !(await onEnsureRepost())) return false;
        return true;
      }

      const created = await createPost({
        ...data,
        poll: data.poll ?? undefined,
        quotedPostId: post.isComment ? undefined : post.id,
        quotedCommentId: post.isComment ? post.id : undefined,
        quotedTargetVersionId: post.versionId,
      }).unwrap();

      return created;
    },
  });

  const { isConfirmOpen, requestClose, cancelDiscard, confirmDiscard } =
    useUnsavedChangesGuard({
      hasChanges: composer.hasChanges,
      isBusy: composer.isPosting,
      onClose,
    });

  useBodyScrollLock(open);

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-modal flex items-start justify-center modal-backdrop p-0 sm:p-4 sm:pt-12"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) requestClose();
        }}
      >
        <div className="relative flex h-full w-full max-w-[600px] flex-col bg-background sm:h-auto sm:max-h-[calc(100vh-clamp(48px,8vh,100px))] sm:rounded-2xl dark:sm:inset-ring dark:sm:inset-ring-control-border">
          <div className="flex items-center gap-6 px-4 py-2">
            <button
              type="button"
              onClick={requestClose}
              disabled={composer.isPosting}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-surface-hover dark:active:bg-muted dark:focus-visible:focus-indicator"
              aria-label="Закрити"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold">Цитувати допис</h2>
          </div>

          <div className="overflow-y-auto overscroll-contain px-4 pb-4">
            <Composer
              composer={composer}
              quotedPost={quote}
              placeholder="Додайте коментар"
              submitLabel="Опублікувати"
              onSuccess={onClose}
              showAvatar
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        title="Вийти без збереження?"
        description="Ваш незавершений допис із цитатою буде втрачено."
        confirmText="Вийти"
        cancelText="Залишитися"
        onCancel={cancelDiscard}
        onConfirm={confirmDiscard}
      />
    </>,
    document.body,
  );
}
