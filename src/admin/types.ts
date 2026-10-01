import type { User } from "@/types/user";
import type {
  ReportDecision,
  ReportSignal,
  ReportSource,
  ReportStatus,
  ReportTargetType,
} from "@/types/report";

export type AdminUser = User & { isBlocked: boolean };
export type AnalyticsPeriod = "7d" | "30d";
export type ContentType = "all" | "posts" | "comments";
export type SortOrder = "newest" | "oldest";

export interface ListParams {
  page: number;
  search: string;
  sort: SortOrder;
}

export interface UsersParams extends ListParams {
  status: "all" | "active" | "blocked";
}

export interface ModerationParams extends ListParams {
  type: ReportTargetType | "all";
  source: ReportSource | "all";
  status: ReportStatus | "all";
  decision: ReportDecision | "all";
}

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; total: number; totalPages: number };
}

export interface AnalyticsPoint {
  date: string;
  value: number;
}

export interface DashboardAnalytics {
  audience: Record<AnalyticsPeriod, AnalyticsPoint[]>;
  activity: Record<
    AnalyticsPeriod,
    { posts: AnalyticsPoint[]; comments: AnalyticsPoint[] }
  >;
}

export interface DashboardMetric {
  id: string;
  title: string;
  value: number | null;
}

export interface DashboardTables {
  latestUsers: AdminUser[];
  latestReports: {
    targetType: ReportTargetType;
    targetId: string;
    count: number;
    latestSignal: ReportSignal;
    target: ReportSignal["target"];
  }[];
}
export type UserAction = "block" | "unblock" | "delete";
