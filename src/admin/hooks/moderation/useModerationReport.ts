import { useEffect, useState } from "react";

import type { ModerationReport } from "@/admin/types/moderation.ts";
import { moderationSignals } from "@/mock/data/admin/moderationSignals";

export function useModerationReport(
    reportId: string | undefined,
) {
    const [data, setData] = useState<ModerationReport | null>(null);
    const [isLoading, setIsLoading] = useState(Boolean(reportId));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!reportId) {
            return;
        }

        let cancelled = false;

        async function loadReport() {
            try {
                setIsLoading(true);
                setError(null);

                const signal = moderationSignals.find(
                    (signal) => signal.id === reportId,
                );

                if (!signal) {
                    if (!cancelled) {
                        setData(null);
                        setError("Скаргу не знайдено.");
                    }

                    return;
                }

                const report: ModerationReport = {
                    id: signal.id,

                    type:
                        signal.targetType === "posts"
                            ? "post"
                            : signal.targetType === "comments"
                                ? "comment"
                                : "user",

                    reason: signal.reasonLabel,
                    status: signal.status ?? "pending",
                    source: signal.source,
                    reporter: signal.reporter,
                    targetId: signal.targetId,
                    createdAt: signal.createdAt,
                };

                if (!cancelled) {
                    setData(report);
                }
            } catch {
                if (!cancelled) {
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

        loadReport();

        return () => {
            cancelled = true;
        };
    }, [reportId]);

    return {
        data,
        isLoading: reportId ? isLoading : false,
        error: reportId
            ? error
            : "ID скарги відсутній.",
    };
}