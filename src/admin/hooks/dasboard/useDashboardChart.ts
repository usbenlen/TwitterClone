import { useEffect, useMemo, useRef, useState } from "react";

import { useDashboardAnalytics } from "@/admin/hooks/dasboard";

import type {
    AnalyticsContentType,
    AnalyticsPeriod,
} from "@/admin/types/analytics";

import { AUDIENCE_SCALE } from "@/admin/constants/dashboardChart";

export type AudiencePoint = {
    x: number;
    y: number;
    value: number;
};

const easeOutCubic = (value: number) =>
    1 - Math.pow(1 - value, 3);

function useAnimatedNumber(
    target: number,
    duration: number,
    isReady: boolean,
) {
    const [value, setValue] =
        useState(target);

    const previousValue =
        useRef(target);

    const hasInitialized =
        useRef(false);

    useEffect(() => {
        if (!isReady) {
            return;
        }

        if (!hasInitialized.current) {
            hasInitialized.current = true;

            previousValue.current = target;

            setValue(target);

            return;
        }

        const from = previousValue.current;

        const to = target;

        if (from === to) {
            return;
        }

        const startTime = performance.now();

        let animationFrame = 0;

        const animate = (
            currentTime: number,
        ) => {
            const elapsed = currentTime - startTime;

            const progress = Math.min(
                elapsed / duration, 1
            );

            const easedProgress = easeOutCubic(progress);

            const nextValue = from + (to - from) * easedProgress;

            setValue(nextValue);

            if (progress < 1) {
                animationFrame =
                    requestAnimationFrame(
                        animate,
                    );
            } else {
                setValue(to);

                previousValue.current = to;
            }
        };

        animationFrame =
            requestAnimationFrame(
                animate,
            );

        return () => {
            cancelAnimationFrame(
                animationFrame,
            );
        };
    }, [
        target,
        duration,
        isReady,
    ]);

    return value;
}

export default function useDashboardChart(
    period: AnalyticsPeriod,
) {
    const [contentType, setContentType] =
        useState<AnalyticsContentType>(
            "all",
        );

    const {
        data,
        isLoading,
        error,
    } = useDashboardAnalytics(period);

    const audienceData = data?.audience[period] ?? [];

    const activityPeriodData = data?.activity[period];

    const activityData =
        contentType === "all"
            ? (
                activityPeriodData?.posts ?? []
            ).map(
                (
                    postValue: number,
                    index: number,
                ) =>
                    postValue +
                    (
                        activityPeriodData
                            ?.comments[index] ?? 0
                    ),
            )
            : activityPeriodData?.[
                contentType
            ] ?? [];

    const isAudienceReady =
        data !== null &&
        audienceData.length > 0;

    const isActivityReady =
        data !== null &&
        activityPeriodData !== undefined;

    const previousAudienceData =
        useRef<number[]>([]);

    const hasInitializedAudience =
        useRef(false);

    const [
        animatedAudienceData,
        setAnimatedAudienceData,
    ] = useState<number[]>([]);

    const [
        animatedAudienceCurrent,
        setAnimatedAudienceCurrent,
    ] = useState(0);

    useEffect(() => {
        if (!isAudienceReady) {
            return;
        }

        if (!hasInitializedAudience.current) {
            hasInitializedAudience.current =
                true;

            previousAudienceData.current =
                audienceData;

            setAnimatedAudienceData(
                audienceData,
            );

            setAnimatedAudienceCurrent(
                audienceData[audienceData.length - 1] ?? 0
            );

            return;
        }

        const from =
            previousAudienceData.current;

        const to = audienceData;

        if (
            from.length === to.length &&
            from.every(
                (value, index) =>
                    value === to[index],
            )
        ) {
            return;
        }

        const maxLength = Math.max(
            from.length,
            to.length,
        );

        const startValues =
            Array.from(
                {
                    length: maxLength,
                },
                (_, index) =>
                    from[index] ??
                    from[
                        from.length - 1
                    ] ??
                    0
            );

        const endValues =
            Array.from(
                {
                    length: maxLength,
                },
                (_, index) =>
                    to[index] ??
                    to[
                        to.length - 1
                    ] ??
                    0
            );

        const duration = 300;

        const startTime =
            performance.now();

        let animationFrame = 0;

        const animate = (
            currentTime: number,
        ) => {
            const elapsed =
                currentTime - startTime;

            const progress = Math.min(
                elapsed / duration, 1
            );

            const easedProgress = easeOutCubic(progress);

            const nextValues =
                startValues.map(
                    (
                        startValue,
                        index,
                    ) => {
                        const endValue =
                            endValues[index];

                        return (
                            startValue +
                            (endValue -
                                startValue) *
                                easedProgress
                        );
                    },
                );

            setAnimatedAudienceData(
                nextValues,
            );

            const currentIndex = to.length - 1;

            const currentValue =
                startValues[
                    currentIndex
                ] ?? 0;

            const targetValue =
                endValues[
                    currentIndex
                ] ?? 0;

            const animatedCurrent =
                currentValue +
                (targetValue -
                    currentValue) *
                    easedProgress;

            setAnimatedAudienceCurrent(
                animatedCurrent,
            );

            if (progress < 1) {
                animationFrame =
                    requestAnimationFrame(
                        animate,
                    );
            } else {
                setAnimatedAudienceData(
                    to,
                );

                setAnimatedAudienceCurrent(
                    targetValue,
                );

                previousAudienceData.current = to;
            }
        };

        animationFrame =
            requestAnimationFrame(
                animate,
            );

        return () => {
            cancelAnimationFrame(
                animationFrame,
            );
        };
    }, [
        audienceData,
        isAudienceReady,
    ]);

    const maxAudience = Math.max(
        ...audienceData, 1
    );

    const animatedMaxAudience =
        Math.max(
            ...animatedAudienceData, 1
        );

    const audiencePoints =
        useMemo<AudiencePoint[]>(
            () =>
                animatedAudienceData.map(
                    (value, index) => {
                        const x =
                            (index /
                                Math.max(
                                    animatedAudienceData.length -
                                        1,
                                    1,
                                )) *
                            100;

                        const y =
                            92 -
                            (value /
                                animatedMaxAudience) *
                                84;

                        return {
                            x,
                            y,
                            value,
                        };
                    },
                ),
            [
                animatedAudienceData,
                animatedMaxAudience,
            ],
        );

    const points = useMemo(
        () =>
            audiencePoints
                .map(
                    ({ x, y }) =>
                        `${x},${y}`,
                )
                .join(" "),
        [audiencePoints],
    );

    const areaPoints = useMemo(
        () =>
            [
                "0,92",
                points,
                "100,92",
            ].join(" "),
        [points],
    );

    const audienceCurrent =
        animatedAudienceCurrent;

    const audienceTotal =
        audienceCurrent *
        AUDIENCE_SCALE;

    const activityMax = Math.max(
        ...activityData,
        1,
    );

    const activityScaleMax =
        Math.max(
            10,
            Math.ceil(
                activityMax / 10,
            ) * 10,
        );

    const activityTotal = activityData.reduce(
        (
            sum: number,
            value: number,
        ) => sum + value,
        0,
    );

    const activityAverage =
        activityData.length > 0
            ? Math.round(
                  activityTotal /
                      activityData.length,
              )
            : 0;

    const animatedActivityTotal =
        useAnimatedNumber(
            activityTotal,
            250,
            isActivityReady,
        );

    const animatedActivityAverage =
        useAnimatedNumber(
            activityAverage,
            250,
            isActivityReady,
        );

    const activityYLabels = [
        activityScaleMax,
        Math.round(
            activityScaleMax * 0.75,
        ),
        Math.round(
            activityScaleMax * 0.5,
        ),
        Math.round(
            activityScaleMax * 0.25,
        ),
        0,
    ];

    const xAxisLabels =
        getXAxisLabels(period);

    return {
        period,

        contentType,
        setContentType,

        data,
        isLoading,
        error,

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
    };
}

function getXAxisLabels(
    period: AnalyticsPeriod,
) {
    if (period === "7d") {
        return [
            "Пн",
            "Вт",
            "Ср",
            "Чт",
            "Пт",
            "Сб",
            "Нд",
        ];
    }

    if (period === "30d") {
        return [
            "1",
            "5",
            "10",
            "15",
            "20",
            "25",
            "30",
        ];
    }

    return [];
}
