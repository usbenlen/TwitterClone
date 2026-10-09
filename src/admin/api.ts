import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { mapPostToTweet, type BackendPost } from "@/api/mappers/post.mapper";
import { mapUserRole, type BackendUser } from "@/api/mappers/user.mapper";
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
    if (value !== "all" && String(value).trim())
      query.set(key, String(value).trim());

  return query.toString();
}

export type BackendReport = Omit<ReportSignal, "target"> & {
  target:
    | { type: "users"; data: BackendUser<AdminUser> }
    | { type: "posts" | "comments"; data: BackendPost }
    | null;
};

function mapReportTarget(
  target: BackendReport["target"],
): ReportSignal["target"] {
  if (!target) return null;
  if (target.type === "users")
    return { type: target.type, data: mapUserRole(target.data) };

  return {
    type: target.type,
    data: {
      ...mapPostToTweet(target.data),
      isComment: target.type === "comments",
    },
  };
}

export function mapReport(report: BackendReport): ReportSignal {
  return { ...report, target: mapReportTarget(report.target) };
}

export const realAdminApi = {
  users: async (params: UsersParams): Promise<Paginated<AdminUser>> => {
    const result = await apiClient.get<Paginated<BackendUser<AdminUser>>>(
      `${ENDPOINTS.admin.users.all}?${listQuery(params)}`,
    );
    return { ...result, items: result.items.map(mapUserRole) };
  },

  user: (id: string) =>
    apiClient
      .get<BackendUser<AdminUser>>(ENDPOINTS.admin.users.byId(id))
      .then(mapUserRole),

  actOnUser: async (id: string, action: UserAction): Promise<void> => {
    if (action === "delete")
      await apiClient.delete(ENDPOINTS.admin.users.delete(id));
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

  metrics: () =>
    apiClient.get<DashboardMetric[]>(ENDPOINTS.admin.dashboard.metrics),
  analytics: (period: AnalyticsPeriod) =>
    apiClient.get<DashboardAnalytics>(ENDPOINTS.admin.dashboard.charts(period)),
  tables: async (limit: number): Promise<DashboardTables> => {
    const result = await apiClient.get<
      Omit<DashboardTables, "latestUsers" | "latestReports"> & {
        latestUsers: BackendUser<AdminUser>[];
        latestReports: (Omit<
          DashboardTables["latestReports"][number],
          "target"
        > & { target: BackendReport["target"] })[];
      }
    >(ENDPOINTS.admin.dashboard.tables(limit));
    return {
      ...result,
      latestUsers: result.latestUsers.map(mapUserRole),
      latestReports: result.latestReports.map((row) => ({
        ...row,
        target: mapReportTarget(row.target),
      })),
    };
  },
};

export const adminApi = MOCK_ENABLED ? mockAdminApi : realAdminApi;
