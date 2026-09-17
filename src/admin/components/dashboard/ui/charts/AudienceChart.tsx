import ChartCard from "@/admin/components/dashboard/ui/cards/ChartCard.tsx";
import { AUDIENCE_SCALE } from "@/admin/constants/dashboardChart.ts";
import { formatNumber } from "@/utils/format.ts";

import type { AudiencePoint } from "@/admin/hooks/dasboard/useDashboardChart.ts";

type AudienceChartProps = {
    maxAudience: number;
    audiencePoints: AudiencePoint[];
    points: string;
    areaPoints: string;
    audienceTotal: number;
    xAxisLabels: string[];
};

export default function AudienceChart({
    maxAudience,
    audiencePoints,
    points,
    areaPoints,
    audienceTotal,
    xAxisLabels,
}: AudienceChartProps) {
    return (
        <ChartCard title="Зростання аудиторії">
            <div className="flex h-full flex-col">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Зростання аудиторії
                        </p>

                        <div className="mt-2 flex items-end gap-3">
                            <span className="text-3xl font-bold tracking-tight text-foreground">
                                {formatNumber(
                                    Math.round(
                                        audienceTotal,
                                    ),
                                )}
                            </span>
                        </div>

                    </div>
                </div>

                <div className="flex min-h-[230px] flex-1">
                    <div className="flex w-12 flex-col justify-between pb-8 pt-1 text-[11px] text-muted-foreground">
                        {[100, 75, 50, 25, 0].map(
                            (percent) => {
                                const value =
                                    Math.round(
                                        (maxAudience *
                                            AUDIENCE_SCALE *
                                            percent) /
                                            100,
                                    );

                                return (<span key={percent}> {formatNumber(value)}</span>);
                            },
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

                        <svg
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className="absolute inset-x-0 top-0 h-[calc(100%-2rem)] w-full overflow-visible"
                        >
                            <defs>
                                <linearGradient
                                    id="audience-area-gradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopOpacity="0.2"
                                        className="text-primary"
                                        stopColor="currentColor"
                                    />

                                    <stop
                                        offset="100%"
                                        stopOpacity="0"
                                        className="text-primary"
                                        stopColor="currentColor"
                                    />
                                </linearGradient>
                            </defs>

                            <polygon
                                points={areaPoints}
                                fill="url(#audience-area-gradient)"
                            />

                            <polyline
                                points={points}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                vectorEffect="non-scaling-stroke"
                                className="text-primary"
                            />
                        </svg>

                        <div className="pointer-events-none absolute inset-x-0 bottom-8 top-0">
                            {audiencePoints.map(
                                (
                                    point,
                                    index,
                                ) => (
                                    <div
                                        key={`${point.value}-${index}`}
                                        className="group pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
                                        style={{
                                            left: `${point.x}%`,
                                            top: `${point.y}%`,
                                        }}
                                    >
                                        <div className="absolute -inset-4 cursor-pointer" />

                                        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-muted px-3 py-2 text-xs text-popover-foreground opacity-0 shadow-lg transition-all duration-150 group-hover:-translate-y-1 group-hover:opacity-100">
                                            <div className="text-muted-foreground">
                                                Аудиторія
                                            </div>

                                            <div className="mt-0.5 font-semibold">
                                                {formatNumber(
                                                    Math.round(
                                                        point.value *
                                                            AUDIENCE_SCALE,
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex size-4 scale-0 items-center justify-center rounded-full border-2 border-primary bg-background opacity-0 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100">
                                            <div className="size-1.5 rounded-full bg-primary" />
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 flex justify-between text-[11px] text-muted-foreground">
                            {xAxisLabels.map(
                                (
                                    label,
                                    index,
                                ) => (
                                    <span
                                        key={`${label}-${index}`}
                                    >
                                        {label}
                                    </span>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ChartCard>
    );
}
