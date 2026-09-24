import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";

import { MOCK_ENABLED } from "@/mock/config";
import { mockDashboardApi } from "@/mock/handlers/admin";

import type {
    AnalyticsPeriod,
    DashboardAnalytics,
} from "@/admin/types/analytics";

import type {
    DashboardMetric,
    DashboardTables,
} from "@/admin/types/dashboard";

const realDashboardApi = {
    getMetrics: async (): Promise<DashboardMetric[]> => {
        return apiClient.get<DashboardMetric[]>(
            ENDPOINTS.admin.dashboard.metrics,
        );
    },

    getAnalytics: async (
        period: AnalyticsPeriod,
    ): Promise<DashboardAnalytics> => {
        return apiClient.get<DashboardAnalytics>(
            ENDPOINTS.admin.dashboard.charts(period),
        );
    },

    getTables: async (
        limit = 10,
    ): Promise<DashboardTables> => {
        return apiClient.get<DashboardTables>(
            ENDPOINTS.admin.dashboard.tables(limit),
        );
    },
};

export const dashboardApi = MOCK_ENABLED ? mockDashboardApi : realDashboardApi;