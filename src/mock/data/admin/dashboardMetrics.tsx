import {
    Users,
    FileText,
    AlertTriangle,
    DollarSign,
} from "lucide-react";

import type { ReactNode } from "react";
export type MetricTrendType = "positive" | "negative";
import type { DashboardMetric } from "@/admin/types/dashboard";

export type Metric = {
    id: string;
    title: string;
    value: string;
    trend?: string;
    trendType?: MetricTrendType;
    trendText?: string;
    icon?: ReactNode;
};

export const mockDashboardMetricsData: DashboardMetric[] = [
    {
        id: "users",
        title: "Зареєстровані сьогодні",
        value: "45210",
        trend: "+3.2%",
        trendType: "positive",
        trendText: "за тиждень",
        icon: <Users />,
    },
    {
        id: "posts",
        title: "Нові пости сьогодні",
        value: "980",
        trend: "+12%",
        trendType: "positive",
        trendText: "в порівнянні з вчора",
        icon: <FileText />,
    },
    {
        id: "reports",
        title: "Відкриті скарги",
        value: "28",
        trend: "-5%",
        trendType: "negative",
        trendText: "за тиждень",
        icon: <AlertTriangle />,
    },
    {
        id: "revenue",
        title: "Дохід за 30 днів",
        value: "1600",
        icon: <DollarSign />,
    },
];