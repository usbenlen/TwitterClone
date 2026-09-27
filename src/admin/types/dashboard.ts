import type { AdminUser } from "@/admin/types/users";
import type { ReportSignal } from "@/admin/types/moderation";
import type { Comment, Tweet } from "@/types";
import type { User } from "@/types/user";

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
    value: number | null;
};

export type DashboardReportRow =
    | {
    targetType: "posts";
    targetId: string;
    count: number;
    latestSignal: ReportSignal;
    target: Tweet;
}
    | {
    targetType: "comments";
    targetId: string;
    count: number;
    latestSignal: ReportSignal;
    target: Comment;
}
    | {
    targetType: "users";
    targetId: string;
    count: number;
    latestSignal: ReportSignal;
    target: User;
};

export type DashboardTables = {
    latestReports: DashboardReportRow[];
    latestUsers: AdminUser[];
};