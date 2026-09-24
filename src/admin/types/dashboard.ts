import type { AdminUser } from "@/admin/types/users";
import type { ReportSignal } from "@/admin/types/moderation";
import type { Tweet } from "@/types";

export type DashboardPeriod =
    | "7d"
    | "30d"
    | "all";

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

export type DashboardMetric = {
    id: string;
    title: string;
    value: number;
};

export type DashboardReportRow = {
    targetId: string;
    count: number;
    latestSignal: ReportSignal;
    tweet: Tweet;
};

export type DashboardTables = {
    latestReports: DashboardReportRow[];
    latestUsers: AdminUser[];
};