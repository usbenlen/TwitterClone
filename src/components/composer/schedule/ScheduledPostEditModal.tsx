import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useEffect } from "react";

import Composer from "@/components/composer/Composer";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { useTweetComposer } from "@/hooks/composer";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import { mapMediaToComposerMedia } from "@/utils/mappers";

import type { ScheduledPost, UpdateScheduledPostRequest } from "@/types";

interface ScheduledPostEditModalProps {
  post: ScheduledPost;
  onClose: () => void;
  onSave: (request: UpdateScheduledPostRequest) => Promise<unknown>;
}

export default function ScheduledPostEditModal({
  post,
  onClose,
  onSave,
}: ScheduledPostEditModalProps) {
  const composer = useTweetComposer({
    initialContent: post.content,
    initialMedia: mapMediaToComposerMedia(post.media),
    initialLinkPreview: post.linkPreview ?? null,
    initialScheduledAt: post.scheduledAt,
    allowScheduling: true,
    scheduleSubmitLabel: "Зберегти",
    showScheduledPostsLink: false,
    canClearSchedule: false,
    onScheduledSubmit: onSave,
  });

  const { isConfirmOpen, requestClose, cancelDiscard, confirmDiscard } =
    useUnsavedChangesGuard({
      hasChanges: composer.hasChanges,
      isBusy: composer.isPosting,
      onClose,
    });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-nested-modal flex items-start justify-center bg-black/50 p-0 sm:p-4 sm:pt-12"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scheduled-post-edit-title"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) requestClose();
        }}
      >
        <div className="flex h-full w-full max-w-[600px] flex-col overflow-y-auto bg-background sm:h-auto sm:max-h-[calc(100vh-6rem)] sm:rounded-2xl">
          <header className="flex items-center gap-5 px-4 py-3">
            <button
              type="button"
              onClick={requestClose}
              disabled={composer.isPosting}
              className="flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-50"
              aria-label="Закрити"
            >
              <X size={21} />
            </button>
            <h2 id="scheduled-post-edit-title" className="text-xl font-bold">
              Редагувати запланований допис
            </h2>
          </header>

          <div className="px-4 pb-4">
            <Composer
              composer={composer}
              submitLabel="Зберегти"
              onSuccess={onClose}
              showAvatar
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        title="Вийти без збереження?"
        description="Незбережені зміни запланованого допису буде втрачено."
        confirmText="Вийти"
        cancelText="Залишитися"
        onCancel={cancelDiscard}
        onConfirm={confirmDiscard}
      />
    </>,
    document.body,
  );
}
