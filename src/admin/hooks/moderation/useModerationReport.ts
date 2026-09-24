import { useEffect, useState } from "react";

import { moderationApi } from "@/admin/api/moderation.api.ts";

import type {
    ReportDecision,
    ReportSignal,
    ReportStatus,
} from "@/admin/types/moderation.ts";

export default function useModerationReport(
    reportId: string | undefined,
) {
    const [data, setData] =
        useState<ReportSignal | null>(null);

    const [isLoading, setIsLoading] =
        useState(Boolean(reportId));

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        if (!reportId) {
            return;
        }

        const id = reportId;

        let cancelled = false;

        async function loadReport() {
            try {
                setIsLoading(true);
                setError(null);

                const signal =
                    await moderationApi.getById(id);

                if (!cancelled) {
                    setData(signal);
                }
            } catch {
                if (!cancelled) {
                    setData(null);
                    setError(
                        "Не вдалося завантажити скаргу.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadReport();

        return () => {
            cancelled = true;
        };
    }, [reportId]);

    const updateReport = (
        reportStatus: ReportStatus,
        decision?: ReportDecision,
    ) => {
        setData((current) =>
            current
                ? {
                    ...current,
                    reportStatus,
                    decision,
                }
                : current,
        );
    };

    return {
        data,
        updateReport,
        isLoading: reportId
            ? isLoading
            : false,
        error: reportId
            ? error
            : "ID скарги відсутній.",
    };
}