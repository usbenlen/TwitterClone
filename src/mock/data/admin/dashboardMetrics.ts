import type { DashboardMetric } from "@/admin/types/dashboard";

export const mockDashboardMetricsData: DashboardMetric[] = [
    {
        id: "users",
        title: "Зареєстровані сьогодні",
        value: 45210,
    },
    {
        id: "posts",
        title: "Пости сьогодні",
        value: 980,
    },
    {
        id: "activity",
        title: "Активні сьогодні",
        value: 1000,
    },
    {
        id: "reports",
        title: "Відкриті скарги",
        value: 28,
    },
];