import {
    useEffect,
    useState,
} from "react";

import { dashboardApi } from "@/admin/api/dashboardApi.ts";

import type { AnalyticsPeriod, DashboardAnalyticsResponse } from "@/admin/types/analytics";

export function useDashboardAnalytics(
    period: AnalyticsPeriod,
) {
    const [data, setData] =
        useState<DashboardAnalyticsResponse | null>(
            null,
        );

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadAnalytics() {
            try {
                setIsLoading(true);
                setError(null);

                const response =
                    await dashboardApi.getAnalytics(
                        period,
                    );

                if (!isMounted) {
                    return;
                }

                setData(response);
            } catch {
                if (isMounted) {
                    setError(
                        "Не вдалося завантажити аналітику.",
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadAnalytics();

        return () => {
            isMounted = false;
        };
    }, [period]);

    return {
        data,
        isLoading,
        error,
    };
}
