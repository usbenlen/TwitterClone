
import MetricCard from "@/admin/components/dashboard/ui/cards/MetricCard.tsx";
import { useDashboardMetrics } from "@/admin/hooks/dasboard/useDashboardMetrics.ts";
import { useAuth } from "@/hooks";
import { formatNumber } from "@/utils/format.ts";

export default function DashboardMetric() {
    const { user } = useAuth();

    const { metrics, isLoading } =
        useDashboardMetrics();

    if (isLoading) {
        return (
            <section className="space-y-6">
                <div className="space-y-2">
                    <div className="h-9 w-72 animate-pulse rounded-lg bg-muted" />
                    <div className="h-5 w-96 max-w-full animate-pulse rounded-lg bg-muted" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="h-32 animate-pulse rounded-xl bg-muted"
                            />
                        ),
                    )}
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold">
                    Вітаємо,{" "}
                    {user?.displayName || "Адмін"}!
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Переглядайте ключові показники та
                    активність платформи.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                    <MetricCard
                        key={metric.id}
                        title={metric.title}
                        value={
                            metric.id === "revenue"
                                ? `${formatNumber(
                                    Number(metric.value),
                                )} грн`
                                : formatNumber(
                                      Number(metric.value),
                                  )
                        }
                        trend={metric.trend}
                        trendType={metric.trendType}
                        trendText={metric.trendText}
                        icon={metric.icon}
                    />
                ))}
            </div>
        </section>
    );
}

