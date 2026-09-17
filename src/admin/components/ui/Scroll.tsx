import type { ReactNode } from "react";

interface ScrollProps {
    children: ReactNode;
    className?: string;
}

export default function Scroll({
   children,
}: ScrollProps) {
    return (
        <div
            className={`overflow-y-auto overflow-x-hidden -mr-3 pr-2`}
            style={{
                scrollbarWidth: "auto",
                scrollbarColor: "#334155 transparent",
            }}
        >
            {children}
        </div>
    );
}