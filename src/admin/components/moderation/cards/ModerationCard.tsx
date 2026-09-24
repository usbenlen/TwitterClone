import type {
    MouseEventHandler,
    ReactNode,
} from "react";
import { useRef } from "react";

import type { ReportTargetType } from "@/admin/types/moderation";

type ModerationCardProps = {
    children: ReactNode;
    selected: boolean;
    onOpen: () => void;
    targetType: ReportTargetType;
};

export default function ModerationCard({
    children,
    selected,
    onOpen,
    targetType,
}: ModerationCardProps) {
    const isSelecting = useRef(false);

    const handleMouseDown: MouseEventHandler<HTMLElement> = () => {
        isSelecting.current = false;
    };

    const handleMouseMove: MouseEventHandler<HTMLElement> = () => {
        isSelecting.current = true;
    };

    const handleClick: MouseEventHandler<HTMLElement> = (event) => {
        if (isSelecting.current) {
            isSelecting.current = false;
            return;
        }

        if (
            event.target instanceof HTMLElement &&
            event.target.closest("button")
        ) {
            return;
        }

        onOpen();
    };

    return (
        <article
            data-target-type={targetType}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            className={`grid w-full grid-cols-[minmax(0,1fr)_auto] gap-6 border-t p-4 ${
                selected
                    ? "bg-primary/10 ring-1 ring-inset ring-primary/30"
                    : "cursor-pointer hover:bg-muted/30"
            }`}
        >
            {children}
        </article>
    );
}
