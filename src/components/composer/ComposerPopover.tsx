import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";

import { useEffect } from "react";

interface ComposerPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: HTMLElement | null;
  children: React.ReactNode;
}

export default function ComposerPopover({
  open,
  onOpenChange,
  reference,
  children,
}: ComposerPopoverProps) {
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    placement: "top-start",
    middleware: [offset(8), flip({ padding: 12 }), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    refs.setReference(reference);
  }, [reference, refs]);

  const dismiss = useDismiss(context);
  useInteractions([dismiss]);

  if (!open) return null;

  return (
    <FloatingPortal>
      <div
        // eslint-disable-next-line react-hooks/refs
        ref={refs.setFloating}
        style={floatingStyles}
        className="z-50 overflow-hidden rounded-2xl border border-border bg-background shadow-xl"
      >
        {children}
      </div>
    </FloatingPortal>
  );
}
