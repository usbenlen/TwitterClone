/** @format */

import { useLayoutEffect, useRef } from "react";

import { parseEmoji } from "@/utils/twemoji";

interface TwemojiTextProps {
    text: string;
    className?: string;
}

export default function TwemojiText({
                                        text,
                                        className = "",
                                    }: TwemojiTextProps) {
    const containerRef = useRef<HTMLSpanElement | null>(null);

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.textContent = text;

        parseEmoji(container);
    }, [text]);

    return (
        <span
            ref={containerRef}
            className={className}
            aria-label={text}
        />
    );
}