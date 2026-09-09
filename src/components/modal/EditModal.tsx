import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { useTweetComposer, useUnsavedChangesGuard } from "@/hooks";

import { Composer } from "@/components/composer";
import { ConfirmModal } from "@/components/modal/ConfirmModal";

import type {
  Location,
  Embed,
  ComposerMedia,
  ComposerSubmitData,
  ComposerPoll,
} from "@/types";

interface EditModalProps {
  open: boolean;
  title: string;
  initialContent: string;
  initialMedia?: ComposerMedia[];
  initialPoll?: ComposerPoll | null;
  initialLocation?: Location | null;
  initialEmbed?: Embed | null;
  onClose: () => void;
  onSave: (data: ComposerSubmitData) => Promise<unknown>;
}

export default function EditModal(props: EditModalProps) {
  const { open } = props;

  if (!open) return null;

  return (
    <EditModalInner
      key={open ? "edit-modal-open" : "edit-modal-closed"}
      {...props}
    />
  );
}

function EditModalInner({
  open,
  title,
  initialContent,
  initialMedia,
  initialPoll,
  initialLocation,
  initialEmbed,
  onClose,
  onSave,
}: EditModalProps) {
  const composer = useTweetComposer({
    initialContent,
    initialMedia,
    initialPoll,
    initialLocation,
    initialEmbed,
    onSubmit: onSave,
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
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-8">
              <button
                type="button"
                onClick={requestClose}
                disabled={composer.isPosting}
                className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Закрити"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-bold">{title}</h2>
            </div>
          </div>

          <div className="overflow-y-auto overscroll-contain px-4 pb-4">
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
        description="У вас є незавершене редагування. Якщо вийти зараз, введені зміни будуть втрачені."
        confirmText="Вийти"
        cancelText="Залишитися"
        onCancel={cancelDiscard}
        onConfirm={confirmDiscard}
      />
    </>,
    document.body,
  );
}
