import { useEffect, useRef, useState } from "react";

import { MoreHorizontal, Trash2, Pencil, type LucideIcon } from "lucide-react";

import { cn } from "@/utils/cn.ts";

interface ActionsMenuProps {
  onDelete?: () => void;
  onEdit?: () => void;
}

interface ActionButton {
  icon: LucideIcon;
  label: string;
  variant?: "danger" | "default";
  onClick: () => void;
}

export default function ActionsMenu({ onDelete, onEdit }: ActionsMenuProps) {
  const ACTION_BUTTONS: readonly ActionButton[] = [
    ...(onEdit
      ? [
          {
            icon: Pencil,
            label: "Редагувати",
            onClick: onEdit,
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            icon: Trash2,
            label: "Видалити",
            variant: "danger" as const,
            onClick: onDelete,
          },
        ]
      : []),
  ];

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (target instanceof Node && menuRef.current?.contains(target)) return;

      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  if (ACTION_BUTTONS.length === 0) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        className="p-0.5 rounded-full text-muted-foreground transition-colors hover:text-foreground flex items-center justify-center"
        aria-label="Додаткові дії"
        aria-expanded={open}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-popover mt-1 min-w-44 overflow-hidden rounded-xl border border-border bg-background shadow-xl"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          {ACTION_BUTTONS.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  action.onClick();
                }}
                className={cn("cursor-pointer flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors first:rounded-t-xl last:rounded-b-xl",
                  action.variant === "danger"
                  ? "text-destructive  hover:bg-destructive/10"
                  : "hover:bg-muted")
                }
              >
                <Icon size={18} />
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
