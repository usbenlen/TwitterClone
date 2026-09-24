import type { ReportSignal } from "@/admin/types/moderation";

type ReportStatsProps = {
    signals: ReportSignal[];
};

const MAX_VISIBLE_REPORTERS = 5;

export default function ReportStats({
    signals,
}: ReportStatsProps) {
    const groupedReports = Object.values(
        signals.reduce<
            Record<
                string,
                {
                    reason: string;
                    count: number;
                    reporters: string[];
                }
            >
        >((groups, signal) => {
            const key = signal.reason;

            if (!groups[key]) {
                groups[key] = {
                    reason: signal.reasonLabel,
                    count: 0,
                    reporters: [],
                };
            }

            groups[key].count += 1;

            if (signal.reporter) {
                groups[key].reporters.push(
                    signal.reporter.username,
                );
            }

            return groups;
        }, {}),
    );

    const totalReports = signals.length;

    const uniqueReporters = new Set(
        signals
            .map((signal) => signal.reporter?.username)
            .filter(Boolean),
    ).size;

    if (signals.length === 0) {
        return null;
    }

    return (
        <section className="rounded-2xl border border-border bg-card p-4">
            <div>
                <h2 className="text-lg font-semibold">
                    Скарги
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    {totalReports} скарг, {uniqueReporters} користувачів
                </p>
            </div>

            <div className="mt-5 space-y-5">
                {groupedReports.map(
                    ({ reason, count, reporters }) => {
                        const visibleReporters =
                            reporters.slice(0, MAX_VISIBLE_REPORTERS);

                        const hiddenCount =
                            reporters.length -
                            visibleReporters.length;

                        return (
                            <div key={reason}>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">
                                        {reason}:
                                    </span>

                                    <span className="text-sm font-semibold text-foreground">
                                        {count}
                                    </span>
                                </div>

                                {reporters.length > 0 && (
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                        {visibleReporters.map(
                                            (username) => (
                                                <span
                                                    key={username}
                                                    className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                                                >
                                                    @{username}
                                                </span>
                                            ),
                                        )}

                                        {hiddenCount > 0 && (
                                            <span className="px-1 text-xs font-medium text-muted-foreground">
                                                +{hiddenCount} інших
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    },
                )}
            </div>
        </section>
    );
}