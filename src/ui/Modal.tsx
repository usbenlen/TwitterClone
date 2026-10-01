import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useId, type ReactNode } from "react";
import { X } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { cn } from "@/utils/cn";

interface ModalProps {
  open: boolean;
  title: string;
  busy?: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}
export function Modal({
  open,
  title,
  busy = false,
  onClose,
  children,
  className,
}: ModalProps) {
  const titleId = useId();
  const { refs, context } = useFloating({
    open,
    onOpenChange: (value) => {
      if (!value && !busy) onClose();
    },
  });
  const { getFloatingProps } = useInteractions([
    useDismiss(context, { enabled: !busy }),
    useRole(context, { role: "dialog" }),
  ]);
  useBodyScrollLock(open);
  if (!open) return null;
  return (
    <FloatingPortal>
      <FloatingOverlay className="z-confirm-modal flex items-center justify-center bg-black/50 p-4">
        <FloatingFocusManager context={context}>
          <section
            // eslint-disable-next-line react-hooks/refs
            ref={refs.setFloating}
            {...getFloatingProps()}
            aria-labelledby={titleId}
            aria-busy={busy}
            className={cn(
              "max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-xl",
              className,
            )}
          >
            <header className="mb-4 flex items-center justify-between gap-3">
              <h2 id={titleId} className="text-xl font-bold">
                {title}
              </h2>
              <button
                type="button"
                disabled={busy}
                aria-label="Закрити"
                onClick={onClose}
                className="rounded-full p-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </header>
            {children}
          </section>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  );
}
