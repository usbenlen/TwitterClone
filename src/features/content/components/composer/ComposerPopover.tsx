import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { useEffect } from "react";

import { COMPOSER_POPOVER } from "@/features/content/constants/composer";
import { cn } from "@/shared/lib/cn";

interface ComposerPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: HTMLElement | null;
  children: React.ReactNode;
  className?: string;
}

export default function ComposerPopover({
  open,
  onOpenChange,
  reference,
  children,
  className,
}: ComposerPopoverProps) {
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    placement: "bottom-start",
    middleware: [
      offset(COMPOSER_POPOVER.OFFSET),
      flip({ padding: COMPOSER_POPOVER.VIEWPORT_PADDING }),
      shift({ padding: COMPOSER_POPOVER.VIEWPORT_PADDING }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    refs.setReference(reference);
  }, [reference, refs]);

  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);

  if (!open || !reference) return null;

  return (
    <FloatingPortal>
      <div
        // eslint-disable-next-line react-hooks/refs
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
        className={cn(
          "z-popover overflow-hidden rounded-2xl border border-border bg-background shadow-xl dark:border-control-border dark:bg-card",
          className,
        )}
      >
        {children}
      </div>
    </FloatingPortal>
  );
}
