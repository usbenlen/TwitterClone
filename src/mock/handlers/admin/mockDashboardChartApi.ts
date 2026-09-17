import type {
    AnalyticsPeriod,
    DashboardAnalyticsResponse,
} from "@/admin/types/analytics";

import { dashboardAnalyticsMock } from "@/mock/data/admin/dashboardAnalytics";

export const mockDashboardChartApi = {
    async getAnalytics(
        _period: AnalyticsPeriod,
    ): Promise<DashboardAnalyticsResponse> {
        return dashboardAnalyticsMock;
    },
};