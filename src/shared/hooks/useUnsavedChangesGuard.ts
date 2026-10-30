import { useCallback, useEffect, useState } from "react";

interface UseUnsavedChangesGuardProps {
  hasChanges: boolean;
  isBusy?: boolean;
  onClose: () => void;
}

export function useUnsavedChangesGuard({
  hasChanges,
  isBusy = false,
  onClose,
}: UseUnsavedChangesGuardProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const requestClose = useCallback(() => {
    if (isBusy) return;

    if (hasChanges) {
      setIsConfirmOpen(true);
      return;
    }

    onClose();
  }, [hasChanges, isBusy, onClose]);

  const cancelDiscard = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  const confirmDiscard = useCallback(() => {
    setIsConfirmOpen(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      event.preventDefault();

      if (isConfirmOpen) return;

      requestClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isConfirmOpen, requestClose]);

  return {
    isConfirmOpen,
    requestClose,
    cancelDiscard,
    confirmDiscard,
  };
}
