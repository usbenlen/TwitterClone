import type { ReactNode } from "react";

export type DashboardPeriod = "7d" | "30d" | "all";

export type DashboardContentType =
    | "all"
    | "posts"
    | "comments";

export type DashboardChartData = {
    audience: number[];
    activity: Record<
        DashboardContentType,
        number[]
    >;
};

export type MetricTrendType =
    | "positive"
    | "negative";

export type DashboardMetric = {
    id: string;
    title: string;
    value: string;
    trend?: string;
    trendType?: MetricTrendType;
    trendText?: string;
    icon?: ReactNode;
};