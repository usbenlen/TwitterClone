/** @format */

import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

interface TabProps {
    active: boolean;
    children: ReactNode;
}

export default function Tab({ active, children }: TabProps) {
    return (
        <span
            className={cn(
                "relative pb-3 text-sm font-medium",
                active
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground",
                "after:absolute after:inset-x-0 after:bottom-0",
                "after:h-0.75 after:rounded-full after:bg-primary",
                !active && "after:hidden",
            )}
        >
      {children}
    </span>
    );
}