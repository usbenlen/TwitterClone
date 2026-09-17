import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

import { MOCK_ENABLED } from "@/mock/config";
import { mockDashboardApi } from "@/mock/handlers/admin";

import type {
    AnalyticsPeriod,
    DashboardAnalyticsResponse
} from "@/admin/types/analytics";

import type { Metric } from "@/admin/types/dashboardMetrics";
import type { DashboardTablesResponse } from "@/admin/types/dashboardTables";

const realDashboardApi = {
    getMetrics: async (): Promise<Metric[]> => {
        return apiClient.get<Metric[]>(
            ENDPOINTS.admin.dashboard.metrics,
        );
    },

    getAnalytics: async (
        period: AnalyticsPeriod,
    ): Promise<DashboardAnalyticsResponse> => {
        return apiClient.get<DashboardAnalyticsResponse>(
            ENDPOINTS.admin.dashboard.charts(period),
        );
    },

    getTables: async (
        limit = 20,
    ): Promise<DashboardTablesResponse> => {
        return apiClient.get<DashboardTablesResponse>(
            ENDPOINTS.admin.dashboard.tables(limit),
        );
    },
};


export const dashboardApi = MOCK_ENABLED ? mockDashboardApi : realDashboardApi;