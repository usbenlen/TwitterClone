/** @format */

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";

interface CommentActionsMenuProps {
    onDelete: () => void;
}

export default function CommentActionsMenu({
                                               onDelete,
                                           }: CommentActionsMenuProps) {
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

    const handleDelete = () => {
        setOpen(false);
        onDelete();
    };

    return (
        <div
            ref={menuRef}
            className="relative"
        >
            <button
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    setOpen((current) => !current);
                }}
                className="rounded-full text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                aria-label="Додаткові дії"
                aria-expanded={open}
            >
                <MoreHorizontal className="size-5" />
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full z-40 mt-1 min-w-44 overflow-hidden rounded-xl border border-border bg-background py-1 shadow-xl"
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                >
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                        <Trash2 className="size-4" />
                        Видалити
                    </button>
                </div>
            )}
        </div>
    );
}