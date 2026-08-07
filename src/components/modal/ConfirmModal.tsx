interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl border border-gray-200">

        <h2 className="text-xl font-bold">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-muted-foreground">
            {description}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">

          <button
            onClick={onCancel}
            className="rounded-lg font-semibold border px-4 py-2 hover:bg-muted hover:pointer"
          >
            Скасувати
          </button>

          <button
            onClick={onConfirm}
            className="rounded-lg font-semibold bg-red-500 px-4 py-2 text-white hover:bg-red-600 hover:pointer"
          >
            Видалити
          </button>

        </div>

      </div>

    </div>
  );
}