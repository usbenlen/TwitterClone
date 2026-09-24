import { useEffect, useState } from "react";

import { dashboardApi } from "@/admin/api/dashboard.api.ts";

import type { DashboardReportRow, DashboardTables } from "@/admin/types/dashboard";

import type { AdminUser } from "@/admin/types/users.ts";

export default function useDashboardTables() {
    const [latestUsers, setLatestUsers] = useState<AdminUser[]>([]);
    const [latestReports, setLatestReports] = useState<
        DashboardReportRow[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadDashboardTables() {
            try {
                setIsLoading(true);
                setError(null);

                const response: DashboardTables =
                    await dashboardApi.getTables();

                if (!isMounted) {
                    return;
                }

                setLatestUsers(response.latestUsers);
                setLatestReports(response.latestReports);
            } catch {
                if (isMounted) {
                    setError(
                        "Не вдалося завантажити дані dashboard.",
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadDashboardTables();

        return () => {
            isMounted = false;
        };
    }, []);

    const openReportsCount = latestReports.reduce(
        (total, report) => total + report.count,
        0,
    );

    const getReportLabel = (count: number) => {
        if (count === 1) {
            return "скарга";
        }

        if (count >= 2 && count <= 4) {
            return "скарги";
        }

        return "скарг";
    };

    return {
        latestUsers,
        latestReports,
        openReportsCount,
        getReportLabel,
        isLoading,
        error,
    };
}