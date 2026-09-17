import type {
    MouseEventHandler,
    ReactNode,
} from "react";
import { useRef } from "react";

type ModerationCardProps = {
    children: ReactNode;
    selected: boolean;
    onOpen: () => void;
}

export default function ModerationCard({
    children,
    selected,
    onOpen,
}: ModerationCardProps) {
    const isSelecting = useRef(false);

    const handleMouseDown: MouseEventHandler<HTMLElement> = () => {
        isSelecting.current = false;
    };

    const handleMouseMove: MouseEventHandler<HTMLElement> = () => {
        isSelecting.current = true;
    };

    const handleClick: MouseEventHandler<HTMLElement> = (
        event,
    ) => {
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
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            className={`grid w-full grid grid-cols-[minmax(0,2fr)_auto] p-4 border-t
            ${
                selected
                    ? "bg-primary/10 ring-1 ring-inset ring-primary/30"
                    : "cursor-pointer hover:bg-muted/30"
                }
            `}
        >
            {children}
        </article>
    );
}

