import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Trash2, Flag, type LucideIcon } from "lucide-react";

interface CommentActionsMenuProps {
  isOwn: boolean;
  onDelete: () => void;
  onReport: () => void;
}

interface ActionButton {
  icon: LucideIcon;
  label: string;
  variant?: "danger" | "default";
  onClick: () => void;
}

export default function CommentActionsMenu({
    isOwn,
    onDelete,
    onReport,
}: CommentActionsMenuProps) {
  const ACTION_BUTTONS: readonly ActionButton[] = isOwn
      ? [
        {
          icon: Trash2,
          label: "Видалити",
          variant: "danger",
          onClick: onDelete,
        },
      ]
      : [
        {
          icon: Flag,
          label: "Подати скаргу",
          variant: "default",
          onClick: onReport,
        },
      ];

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
          target instanceof Node &&
          menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener(
        "pointerdown",
        handlePointerDown,
    );

    return () => {
      document.removeEventListener(
          "pointerdown",
          handlePointerDown,
      );
    };
  }, [open]);

  return (
      <div ref={menuRef} className="relative">
        <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setOpen((current) => !current);
            }}
            className="cursor-pointer rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Додаткові дії"
            aria-expanded={open}
        >
          <MoreHorizontal size={18} />
        </button>

        {open && (
            <div
                className="absolute right-0 top-full z-40 mt-1 min-w-44 overflow-hidden rounded-xl border border-border bg-background py-1 shadow-xl"
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
                        className={
                          action.variant === "danger"
                              ? "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                              : "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:bg-foreground/10"
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