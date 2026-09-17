import type { ReactNode } from "react";

export type Metric = {
    id: string;
    title: string;
    value: number | string;
    trend?: string;
    trendType?: "positive" | "negative";
    trendText?: string;
    icon?: ReactNode;
};