import type {
    AnalyticsPeriod,
    DashboardAnalytics,
} from "@/admin/types/analytics";

import type {
    DashboardMetric,
    DashboardTables,
} from "@/admin/types/dashboard";

import { dashboardAnalyticsMock } from "@/mock/data/admin/dashboardAnalytics";
import { mockDashboardMetricsData } from "@/mock/data/admin/dashboardMetrics.ts";
import { mockDashboardTablesData } from "@/mock/data/admin/dashboardTables.ts";

export const mockDashboardApi = {
    async getAnalytics(
        period: AnalyticsPeriod,
    ): Promise<DashboardAnalytics> {
        void period;

        return dashboardAnalyticsMock;
    },

    async getMetrics(): Promise<DashboardMetric[]> {
        return mockDashboardMetricsData;
    },

    async getTables(
        limit = 10,
    ): Promise<DashboardTables> {
        void limit;

        return mockDashboardTablesData;
    },
};