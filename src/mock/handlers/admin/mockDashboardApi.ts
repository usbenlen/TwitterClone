import type {
    AnalyticsPeriod,
    DashboardAnalyticsResponse,
} from "@/admin/types/analytics";

import type { DashboardMetric } from "@/admin/types/dashboard";

import type { DashboardTablesResponse } from "@/admin/types/dashboardTables";

import { dashboardAnalyticsMock } from "@/mock/data/admin/dashboardAnalytics";
import { mockDashboardMetricsData } from "@/mock/data/admin/dashboardMetrics";
import { mockDashboardTablesData } from "@/mock/data/admin/dashboardTables";

export const mockDashboardApi = {
    async getAnalytics(
        _period: AnalyticsPeriod,
    ): Promise<DashboardAnalyticsResponse> {
        return dashboardAnalyticsMock;
    },

    async getMetrics(): Promise<DashboardMetric[]> {
        return mockDashboardMetricsData;
    },

    async getTables(): Promise<DashboardTablesResponse> {
        return mockDashboardTablesData;
    },
};
