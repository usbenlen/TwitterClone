import type { DashboardMetric } from "@/admin/types/dashboard";

export const mockDashboardMetricsData: DashboardMetric[] = [
    {
        id: "users",
        title: "Зареєстровані сьогодні",
        value: 45210,
    },
    {
        id: "posts",
        title: "Нові пости сьогодні",
        value: 980,
    },
    {
        id: "reports",
        title: "Відкриті скарги",
        value: 28,
    },
    {
        id: "revenue",
        title: "Дохід за 30 днів",
        value: 1600,
    },
];