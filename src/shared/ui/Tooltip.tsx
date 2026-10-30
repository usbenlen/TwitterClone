import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
} from "@floating-ui/react";
import { cloneElement, useState } from "react";

import type { HTMLAttributes, ReactElement, Ref } from "react";

interface TooltipProps {
  label: string;
  disabled?: boolean;
  children: ReactElement<
    HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement>; disabled?: boolean }
  >;
}

export function Tooltip({
  label,
  children,
  disabled: tooltipDisabled = false,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const disabled = tooltipDisabled || (children.props.disabled ?? false);

  const { refs, floatingStyles, context } = useFloating({
    open: open && !disabled,
    onOpenChange: setOpen,
    placement: "bottom",
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    enabled: !disabled,
    mouseOnly: true,
    delay: { open: 450, close: 0 },
  });

  const focus = useFocus(context, { enabled: !disabled, visibleOnly: true });
  const dismiss = useDismiss(context, { referencePress: true });

  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  // Floating UI's setter is a callback; merging it does not read ref.current.
  // eslint-disable-next-line react-hooks/refs
  const ref = useMergeRefs([refs.setReference, children.props.ref]);

  return (
    <>
      {cloneElement(children, {
        ...getReferenceProps({
          ...children.props,
          onClick: (event: React.MouseEvent<HTMLElement>) => {
            setOpen(false);
            children.props.onClick?.(event);
          },
        }),
        ref,
      })}
      {open && !disabled && (
        <FloatingPortal>
          <div
            // eslint-disable-next-line react-hooks/refs
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="pointer-events-none z-tooltip max-w-[calc(100vw-1rem)] rounded-md bg-tooltip px-2 py-1 text-xs leading-tight font-medium text-white shadow-sm"
          >
            {label}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
