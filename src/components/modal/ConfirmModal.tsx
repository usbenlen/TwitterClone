import { Modal, Button } from "@/ui";
interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "destructive";
  busy?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Підтвердити",
  cancelText = "Скасувати",
  confirmVariant = "destructive",
  busy = false,
  error,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      busy={busy}
      onClose={onCancel}
      className="max-w-sm"
    >
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" disabled={busy} onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} isLoading={busy} onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
