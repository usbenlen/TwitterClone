import { Modal, Button, type ButtonProps } from "@/ui";
interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "destructive";
  buttonSize?: ButtonProps["size"];
  buttonShape?: ButtonProps["shape"];
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
  buttonSize,
  buttonShape,
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
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button
          variant="outline"
          size={buttonSize}
          shape={buttonShape}
          disabled={busy}
          onClick={onCancel}
        >
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          size={buttonSize}
          shape={buttonShape}
          isLoading={busy}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
