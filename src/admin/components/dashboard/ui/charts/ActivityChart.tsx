import ChartCard from "@/admin/components/dashboard/ui/cards/ChartCard.tsx";
import TypeSelect from "@/admin/components/ui/selects/TypeSelect.tsx";

import type { AnalyticsContentType, AnalyticsPeriod } from "@/admin/types/analytics.ts";
import { formatNumber } from "@/utils/format.ts";

type ActivityChartProps = {
    contentType: AnalyticsContentType;
    setContentType: (
        value: AnalyticsContentType,
    ) => void;

    animatedTotal: number;
    animatedAverage: number;

    activityData: number[];
    activityScaleMax: number;
    activityYLabels: number[];

    xAxisLabels: string[];

    period: AnalyticsPeriod;
};

export default function ActivityChart({
    contentType,
    setContentType,
    animatedTotal,
    activityData,
    activityScaleMax,
    activityYLabels,
    xAxisLabels,
}: ActivityChartProps) {
    return (
        <ChartCard title="Активність">
            <div className="flex h-full flex-col">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Активність
                        </p>

                        <div className="mt-2 flex items-end gap-3">
                            <span className="text-3xl font-bold tracking-tight text-foreground">
                                {formatNumber(
                                    Math.round(
                                        animatedTotal,
                                    ),
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="shrink-0">
                        <TypeSelect
                            value={contentType}
                            onChange={
                                setContentType
                            }
                        />
                    </div>
                </div>

                <div className="flex min-h-[230px] flex-1">
                    <div className="flex w-8 flex-col justify-between pb-8 pt-1 text-[11px] text-muted-foreground">
                        {activityYLabels.map(
                            (
                                value,
                                index,
                            ) => (
                                <span
                                    key={`${value}-${index}`}
                                >
                                    {value}
                                </span>
                            ),
                        )}
                    </div>

                    <div className="relative min-w-0 flex-1 pb-8">
                        <div className="pointer-events-none absolute inset-x-0 bottom-8 top-0 flex flex-col justify-between">
                            {[0, 1, 2, 3, 4].map(
                                (line) => (
                                    <div
                                        key={line}
                                        className="border-t border-dashed border-border/70"
                                    />
                                ),
                            )}
                        </div>

                        <div className="absolute inset-x-0 bottom-8 top-0 flex items-end justify-between gap-1.5">
                            {activityData.map(
                                (
                                    value,
                                    index,
                                ) => {
                                    const height = activityScaleMax > 0 ? (value / activityScaleMax) * 100 : 0;

                                    return (
                                        <div
                                            key={index}
                                            className="group relative z-10 flex h-full flex-1 items-end"
                                        >
                                            <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-muted px-3 py-2 text-xs font-medium text-popover-foreground opacity-0 shadow-lg transition-all duration-150 group-hover:-translate-y-1 group-hover:opacity-100">
                                                {value}{" "}
                                                {contentType === "posts" ? "постів" : ""}
                                                {contentType === "comments" ? "коментарів" : ""}
                                                {contentType === "all" ? "активностей" : ""}
                                            </div>

                                            <div
                                                className="w-full rounded-t-4xl bg-primary transition-[height] duration-250 ease-out"
                                                style={{height: value > 0 ? `${Math.max(height, 4)}%` : "0%"}}
                                            />
                                        </div>
                                    );
                                },
                            )}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 flex justify-between text-[11px] text-muted-foreground">
                            {xAxisLabels.map(
                                (
                                    label,
                                    index,
                                ) => (
                                    <span key={`${label}-${index}`}>{label}</span>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ChartCard>
    );
}