import {
  mapReport,
  mapReportTarget,
} from "@/features/moderation/api/mappers/reportMapper";
import { mapUserRole } from "@/features/profiles/api/mappers/profileMapper";
import { ENDPOINTS, apiClient } from "@/shared/api";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";
import { mockAdminApi } from "@/mock/handlers/mockAdminApi";

import type {
  AdminUser,
  AnalyticsPeriod,
  BackendReport,
  DashboardAnalytics,
  DashboardMetric,
  DashboardTables,
  ModerationParams,
  Paginated,
  ReportDecision,
  ReportSignal,
  UserAction,
  UsersParams,
} from "@/features/moderation/types";
import type { BackendUser } from "@/features/profiles/types";

export function listQuery(params: UsersParams | ModerationParams): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params))
    if (value !== "all" && String(value).trim()) query.set(key, String(value).trim());

  return query.toString();
}

const adminRequestOptions = { refreshOnForbidden: true };

export const realAdminApi = {
  users: async (params: UsersParams): Promise<Paginated<AdminUser>> => {
    const result = await apiClient.get<Paginated<BackendUser<AdminUser>>>(
      `${ENDPOINTS.admin.users.all}?${listQuery(params)}`,
      adminRequestOptions,
    );
    return { ...result, items: result.items.map(mapUserRole) };
  },

  user: (id: string) =>
    apiClient
      .get<BackendUser<AdminUser>>(ENDPOINTS.admin.users.byId(id), adminRequestOptions)
      .then(mapUserRole),

  actOnUser: async (id: string, action: UserAction): Promise<void> => {
    if (action === "delete") await apiClient.delete(ENDPOINTS.admin.users.delete(id), adminRequestOptions);
    else await apiClient.put(ENDPOINTS.admin.users[action](id), undefined, adminRequestOptions);
  },

  reports: async (
    params: ModerationParams,
  ): Promise<Paginated<ReportSignal>> => {
    const result = await apiClient.get<Paginated<BackendReport>>(
      `${ENDPOINTS.admin.moderation.all}?${listQuery(params)}`,
      adminRequestOptions,
    );
    return { ...result, items: result.items.map(mapReport) };
  },

  report: async (id: string) =>
    mapReport(
      await apiClient.get<BackendReport>(ENDPOINTS.admin.moderation.byId(id), adminRequestOptions),
    ),

  resolveReport: async (id: string, decision: ReportDecision) =>
    mapReport(
      await apiClient.put<BackendReport>(
        ENDPOINTS.admin.moderation.status(id),
        { status: "resolved", decision },
        adminRequestOptions,
      ),
    ),

  metrics: () => apiClient.get<DashboardMetric[]>(ENDPOINTS.admin.dashboard.metrics, adminRequestOptions),
  analytics: (period: AnalyticsPeriod) => apiClient.get<DashboardAnalytics>(ENDPOINTS.admin.dashboard.charts(period), adminRequestOptions),
  tables: async (limit: number): Promise<DashboardTables> => {
    const result = await apiClient.get<
      Omit<DashboardTables, "latestUsers" | "latestReports"> & {
        latestUsers: BackendUser<AdminUser>[];
        latestReports: (Omit<
          DashboardTables["latestReports"][number],
          "target"
        > & { target: BackendReport["target"] })[];
      }
    >(ENDPOINTS.admin.dashboard.tables(limit), adminRequestOptions);
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
