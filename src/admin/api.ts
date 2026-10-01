import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { mapPostToTweet, type BackendPost } from "@/api/mappers/post.mapper";
import { MOCK_ENABLED } from "@/mock/config";
import { mockAdminApi } from "@/mock/handlers/admin/mockAdminApi";

import type {
  AdminUser,
  AnalyticsPeriod,
  DashboardAnalytics,
  DashboardMetric,
  DashboardTables,
  ModerationParams,
  Paginated,
  UserAction,
  UsersParams,
} from "@/admin/types";

import type { ReportDecision, ReportSignal } from "@/types/report";

export function listQuery(params: UsersParams | ModerationParams): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params))
    if (value !== "all" && String(value).trim()) query.set(key, String(value).trim());

  return query.toString();
}

export type BackendReport = Omit<ReportSignal, "target"> & {
  target:
    | { type: "users"; data: AdminUser }
    | { type: "posts" | "comments"; data: BackendPost }
    | null;
};

export function mapReport(report: BackendReport): ReportSignal {
  return {
    ...report,
    target: report.target
      ? report.target.type === "users"
        ? report.target
        : {
            type: report.target.type,
            data: {
              ...mapPostToTweet(report.target.data),
              isComment: report.target.type === "comments",
            },
          }
      : null,
  };
}

export const realAdminApi = {
  users: (params: UsersParams) =>
    apiClient.get<Paginated<AdminUser>>(
      `${ENDPOINTS.admin.users.all}?${listQuery(params)}`,
    ),

  user: (id: string) => apiClient.get<AdminUser>(ENDPOINTS.admin.users.byId(id)),

  actOnUser: async (id: string, action: UserAction): Promise<void> => {
    if (action === "delete") await apiClient.delete(ENDPOINTS.admin.users.delete(id));
    else await apiClient.put(ENDPOINTS.admin.users[action](id));
  },

  reports: async (
    params: ModerationParams,
  ): Promise<Paginated<ReportSignal>> => {
    const result = await apiClient.get<Paginated<BackendReport>>(
      `${ENDPOINTS.admin.moderation.all}?${listQuery(params)}`,
    );
    return { ...result, items: result.items.map(mapReport) };
  },

  report: async (id: string) =>
    mapReport(
      await apiClient.get<BackendReport>(ENDPOINTS.admin.moderation.byId(id)),
    ),

  resolveReport: async (id: string, decision: ReportDecision) =>
    mapReport(
      await apiClient.put<BackendReport>(
        ENDPOINTS.admin.moderation.status(id),
        { status: "resolved", decision },
      ),
    ),

  metrics: () => apiClient.get<DashboardMetric[]>(ENDPOINTS.admin.dashboard.metrics),
  analytics: (period: AnalyticsPeriod) => apiClient.get<DashboardAnalytics>(ENDPOINTS.admin.dashboard.charts(period)),
  tables: async (limit: number): Promise<DashboardTables> => {
    const result = await apiClient.get<
      Omit<DashboardTables, "latestReports"> & {
        latestReports: (Omit<
          DashboardTables["latestReports"][number],
          "latestSignal" | "target"
        > & { latestSignal: BackendReport; target: BackendReport["target"] })[];
      }
    >(ENDPOINTS.admin.dashboard.tables(limit));
    return {
      ...result,
      latestReports: result.latestReports.map((row) => ({
        ...row,
        latestSignal: mapReport(row.latestSignal),
        target: mapReport({ ...row.latestSignal, target: row.target }).target,
      })),
    };
  },
};

export const adminApi = MOCK_ENABLED ? mockAdminApi : realAdminApi;
