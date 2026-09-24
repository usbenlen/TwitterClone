import { useState } from "react";

import {
    ActivityChart,
    AudienceChart,
    ChartPeriodSelect,
} from "@/admin/components/dashboard/ui/charts";

import { useDashboardChart } from "@/admin/hooks/dasboard";

import type { AnalyticsPeriod } from "@/admin/types/analytics";
import {Spinner} from "@/ui";

export default function DashboardChart() {
    const [period, setPeriod] =
        useState<AnalyticsPeriod>("30d");

    const {
        contentType,
        setContentType,

        maxAudience,
        audiencePoints,
        points,
        areaPoints,
        audienceTotal,

        animatedActivityTotal,
        animatedActivityAverage,
        activityData,
        activityScaleMax,
        activityYLabels,

        xAxisLabels,

        isLoading,
        error,
    } = useDashboardChart(period);

    if (isLoading) {
        return (
            <section
                id="analytics"
                className="mx-auto w-full max-w-6xl"
            >
                <Spinner/>
            </section>
        );
    }

    if (error) {
        return (
            <section
                id="analytics"
                className="mx-auto w-full max-w-6xl"
            >
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-8 text-center text-sm text-destructive">
                    {error}
                </div>
            </section>
        );
    }

    return (
        <section
            id="analytics"
            className="mx-auto w-full max-w-6xl"
        >
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                        Панель аналітики
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Основні показники активності та зростання аудиторії
                    </p>
                </div>

                <ChartPeriodSelect
                    value={period}
                    onChange={setPeriod}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <AudienceChart
                    maxAudience={maxAudience}
                    audiencePoints={audiencePoints}
                    points={points}
                    areaPoints={areaPoints}
                    audienceTotal={audienceTotal}
                    xAxisLabels={xAxisLabels}
                />

                <ActivityChart
                    contentType={contentType}
                    setContentType={setContentType}
                    animatedTotal={animatedActivityTotal}
                    animatedAverage={animatedActivityAverage}
                    activityData={activityData}
                    activityScaleMax={activityScaleMax}
                    activityYLabels={activityYLabels}
                    xAxisLabels={xAxisLabels}
                    period={period}
                />
            </div>
        </section>
    );
}