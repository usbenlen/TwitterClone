import type { AdminUser } from "@/admin/types/users";
import type { ModerationSignal } from "@/admin/types/moderation";
import type {Tweet} from "@/types";

export type DashboardReportRow = {
    targetId: string;
    count: number;
    latestSignal: ModerationSignal;
    tweet: Tweet;
};

export type DashboardTablesResponse = {
    latestReports: DashboardReportRow[];
    latestUsers: AdminUser[];
};