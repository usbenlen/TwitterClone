import { mockDashboardMetricsData } from "@/mock/data/admin/dashboardMetrics";

import type { DashboardMetric } from "@/admin/types/dashboard";

export const mockDashboardMetricsApi = {
    getAll: async (): Promise<DashboardMetric[]> => {
        return mockDashboardMetricsData;
    },
};