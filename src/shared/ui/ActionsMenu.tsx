import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { MoreHorizontal } from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "@/shared/lib/cn";
import { Tooltip } from "@/shared/ui/Tooltip";

import type { LucideIcon } from "lucide-react";

export interface ActionsMenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}

export interface ActionsMenuProps {
  items: readonly ActionsMenuItem[];
  ariaLabel?: string;
  menuLabel?: string;
  triggerClassName?: string;
  menuClassName?: string;
}

export function ActionsMenu(props: ActionsMenuProps) {
  return props.items.length > 0 ? <ActionsMenuControl {...props} /> : null;
}

function ActionsMenuControl({
  items,
  ariaLabel = "Більше",
  menuLabel = "Дії",
  triggerClassName,
  menuClassName,
}: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const listRef = useRef<Array<HTMLButtonElement | null>>([]);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const role = useRole(context, { role: "menu" });

  const navigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    disabledIndices: items.flatMap((item, index) =>
      item.disabled ? [index] : [],
    ),
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([click, dismiss, role, navigation]);

  return (
    <>
      <Tooltip label="Більше" disabled={open}>
        <button
          ref={refs.setReference}
          type="button"
          data-actions-menu-trigger
          aria-label={ariaLabel}
          className={cn(
            "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            open && "bg-primary/10 text-primary dark:bg-primary/20",
            triggerClassName,
          )}
          {...getReferenceProps({
            onClick: (event) => event.stopPropagation(),
          })}
        >
          <MoreHorizontal className="size-5" aria-hidden="true" />
        </button>
      </Tooltip>

      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              // eslint-disable-next-line react-hooks/refs -- Floating UI provides a callback ref, as in ComposerPopover.
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps({
                onClick: (event) => event.stopPropagation(),
              })}
              aria-label={menuLabel}
              className={cn(
                "z-popover max-h-[calc(100dvh-1rem)] w-max min-w-44 max-w-[calc(100vw-1rem)] overflow-x-hidden overflow-y-auto rounded-xl border border-border bg-background shadow-xl dark:border-control-border dark:bg-card",
                menuClassName,
              )}
            >
              {items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    ref={(element) => {
                      listRef.current[index] = element;
                    }}
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    tabIndex={activeIndex === index ? 0 : -1}
                    {...getItemProps({
                      onClick: () => {
                        if (item.disabled) return;
                        setOpen(false);
                        item.onSelect();
                      },
                    })}
                    className={cn(
                      "flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left text-sm font-semibold transition-colors first:rounded-t-xl last:rounded-b-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                      item.variant === "danger"
                        ? "text-destructive hover:bg-destructive/10 focus-visible:bg-destructive/10"
                        : "text-foreground hover:bg-muted focus-visible:bg-muted dark:hover:bg-surface-hover",
                    )}
                  >
                    {Icon && (
                      <Icon
                        className="mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-0 flex-1 wrap-break-word">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
