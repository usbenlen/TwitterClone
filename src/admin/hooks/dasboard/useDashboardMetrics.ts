import { useEffect, useState } from "react";

import { dashboardApi } from "@/admin/api/dashboardApi.ts";

import type { Metric } from "@/admin/types/dashboardMetrics.ts";

export function useDashboardMetrics() {
    const [metrics, setMetrics] = useState<Metric[]>([]);
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

