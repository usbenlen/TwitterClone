import { useEffect, useState } from "react";

import { dashboardApi } from "@/admin/api/dashboard.api.ts";

import type { DashboardMetric } from "@/admin/types/dashboard";

export default function useDashboardMetrics() {
    const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
    const [isLoading, setIsLoading] =
        useState(true);
    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadMetrics() {
            try {
                setIsLoading(true);
                setError(null);

                const response =
                    await dashboardApi.getMetrics();

                if (!isMounted) {
                    return;
                }

                setMetrics(response);
            } catch {
                if (isMounted) {
                    setError(
                        "Не вдалося завантажити показники dashboard.",
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadMetrics();

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        metrics,
        isLoading,
        error,
    };
}

