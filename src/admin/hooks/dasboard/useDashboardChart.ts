import { useEffect, useMemo, useRef, useState } from "react";

import { useDashboardAnalytics } from "@/admin/hooks/dasboard";

import type {
    AnalyticsContentType,
    AnalyticsPeriod,
} from "@/admin/types/analytics";

export type AudiencePoint = {
    x: number;
    y: number;
    value: number;
};

const easeOutCubic = (value: number) =>
    1 - Math.pow(1 - value, 3);

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

    const audienceValues = useMemo(
        () =>
            audienceData.map(
                (point) => point.value,
            ),
        [audienceData],
    );

    const activityPeriodData = data?.activity[period];

    const activityData = useMemo(
        () =>
            contentType === "all"
                ? (
                    activityPeriodData?.posts ?? []
                ).map(
                    (postPoint, index) =>
                        postPoint.value +
                        (
                            activityPeriodData
                                ?.comments[index]
                                ?.value ?? 0
                        ),
                )
                : (
                    activityPeriodData?.[
                        contentType
                    ] ?? []
                ).map(
                    (point) => point.value,
                ),
        [
            activityPeriodData,
            contentType,
        ],
    );

    const activityDates = useMemo(
        () =>
            contentType === "all"
                ? (
                    activityPeriodData?.posts ?? []
                ).map(
                    (postPoint) =>
                        postPoint.date,
                )
                : (
                    activityPeriodData?.[
                        contentType
                    ] ?? []
                ).map(
                    (point) => point.date,
                ),
        [
            activityPeriodData,
            contentType,
        ],
    );

    const [
        animatedActivityData,
        setAnimatedActivityData,
    ] = useState<number[]>([]);

    const [
        animatedActivityTotal,
        setAnimatedActivityTotal,
    ] = useState(0);

    useEffect(() => {
        if (
            activityPeriodData === undefined ||
            activityData.length === 0
        ) {
            const resetFrame =
                requestAnimationFrame(() => {
                    setAnimatedActivityData(
                        [],
                    );

                    setAnimatedActivityTotal(
                        0,
                    );
                });

            return () => {
                cancelAnimationFrame(
                    resetFrame,
                );
            };
        }

        const targetValues =
            activityData;

        const targetTotal =
            targetValues.reduce(
                (
                    sum: number,
                    value: number,
                ) => sum + value,
                0,
            );

        const duration = 200;

        let animationFrame = 0;

        const startFrame =
            requestAnimationFrame(() => {
                setAnimatedActivityData(
                    targetValues,
                );

                const startTime =
                    performance.now();

                const animate = (
                    currentTime: number,
                ) => {
                    const elapsed =
                        currentTime -
                        startTime;

                    const progress =
                        Math.min(
                            elapsed /
                                duration,
                            1,
                        );

                    const easedProgress =
                        easeOutCubic(
                            progress,
                        );

                    setAnimatedActivityTotal(
                        targetTotal *
                            easedProgress,
                    );

                    if (
                        progress < 1
                    ) {
                        animationFrame =
                            requestAnimationFrame(
                                animate,
                            );
                    } else {
                        setAnimatedActivityTotal(
                            targetTotal,
                        );
                    }
                };

                animationFrame =
                    requestAnimationFrame(
                        animate,
                    );
            });

        return () => {
            cancelAnimationFrame(
                startFrame,
            );

            cancelAnimationFrame(
                animationFrame,
            );
        };
    }, [
        activityData,
        activityPeriodData,
    ]);

    const animatedActivityAverage =
        animatedActivityData.length > 0
            ? Math.round(
                animatedActivityTotal /
                    animatedActivityData.length,
            )
            : 0;

    const isAudienceReady =
        data !== null &&
        audienceData.length > 0;

    const previousAudienceData =
        useRef<number[]>([]);

    const animatedAudienceDataRef =
        useRef<number[]>([]);

    const audienceMaxRef =
        useRef(1);

    const hasInitializedAudience =
        useRef(false);

    const [
        animatedAudienceData,
        setAnimatedAudienceData,
    ] = useState<number[]>([]);

    const [
        animatedAudienceMax,
        setAnimatedAudienceMax,
    ] = useState(1);

    useEffect(() => {
        if (!isAudienceReady) {
            return;
        }

        if (!hasInitializedAudience.current) {
            hasInitializedAudience.current =
                true;

            const initialMax =
                Math.max(
                    ...audienceValues,
                    1,
                );

            previousAudienceData.current = audienceValues;
            animatedAudienceDataRef.current = audienceValues;
            audienceMaxRef.current = initialMax;

            setAnimatedAudienceMax(
                initialMax,
            );

            const animationFrame =
                requestAnimationFrame(() => {
                    setAnimatedAudienceData(
                        audienceValues,
                    );
                });

            return () => {
                cancelAnimationFrame(
                    animationFrame,
                );
            };
        }

        const from =
            animatedAudienceDataRef.current
                .length > 0
                ? animatedAudienceDataRef.current
                : previousAudienceData.current;

        const to = audienceValues;

        const fromMax = Math.max(audienceMaxRef.current, 1);

        const toMax = Math.max( ...to, 1);

        if (
            from.length === to.length &&
            from.every(
                (value, index) =>
                    value === to[index],
            ) &&
            fromMax === toMax
        ) {
            return;
        }

        const targetLength = to.length;

        const startValues =
            Array.from(
                {
                    length: targetLength,
                },
                (_, index) => {
                    if (
                        targetLength ===
                        1
                    ) {
                        return from[0] ?? 0;
                    }

                    if (
                        from.length ===
                        0
                    ) {
                        return 0;
                    }

                    if (
                        from.length ===
                        1
                    ) {
                        return from[0];
                    }

                    const sourcePosition =
                        (index /
                            Math.max(
                                targetLength -
                                    1,
                                1,
                            )) *
                        (from.length - 1);

                    const leftIndex =
                        Math.floor(
                            sourcePosition,
                        );

                    const rightIndex =
                        Math.min(
                            Math.ceil(
                                sourcePosition,
                            ),
                            from.length - 1,
                        );

                    const fraction =
                        sourcePosition -
                        leftIndex;

                    const leftValue =
                        from[leftIndex] ??
                        0;

                    const rightValue =
                        from[rightIndex] ??
                        leftValue;

                    return (
                        leftValue +
                        (rightValue -
                            leftValue) *
                            fraction
                    );
                },
            );

        const duration = 200;

        const startTime =
            performance.now();

        let animationFrame = 0;

        const animate = (
            currentTime: number,
        ) => {
            const elapsed = currentTime - startTime;

            const progress = Math.min(elapsed / duration, 1);

            const easedProgress = easeOutCubic(progress);

            const nextValues =
                startValues.map(
                    (
                        startValue,
                        index,
                    ) => {
                        const endValue =
                            to[index] ??
                            startValue;

                        return (
                            startValue +
                            (endValue -
                                startValue) *
                                easedProgress
                        );
                    },
                );

            const nextMax =
                fromMax +
                (toMax - fromMax) *
                    easedProgress;

            animatedAudienceDataRef.current =
                nextValues;

            audienceMaxRef.current =
                nextMax;

            setAnimatedAudienceData(
                nextValues,
            );

            setAnimatedAudienceMax(
                nextMax,
            );

            if (progress < 1) {
                animationFrame =
                    requestAnimationFrame(
                        animate,
                    );
            } else {
                animatedAudienceDataRef.current = to;
                previousAudienceData.current = to;
                audienceMaxRef.current = toMax;

                setAnimatedAudienceData(
                    to,
                );

                setAnimatedAudienceMax(
                    toMax,
                );
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
        audienceValues,
        isAudienceReady,
    ]);

    const maxAudience = Math.max(
        ...audienceValues,
        1,
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
                                Math.max(
                                    animatedAudienceMax,
                                    1,
                                )) *
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
                animatedAudienceMax,
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

    const audienceTotal =
        animatedAudienceData[
            animatedAudienceData.length - 1
        ] ?? 0;

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

    const activityTotal =
        activityData.reduce(
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
        audienceData
            .filter(
                (_, index) =>
                    index === 0 ||
                    index ===
                        Math.floor(
                            (audienceData.length -
                                1) /
                                6,
                        ) ||
                    index ===
                        Math.floor(
                            ((audienceData.length -
                                1) *
                                2) /
                                6,
                        ) ||
                    index ===
                        Math.floor(
                            ((audienceData.length -
                                1) *
                                3) /
                                6,
                        ) ||
                    index ===
                        Math.floor(
                            ((audienceData.length -
                                1) *
                                4) /
                                6,
                        ) ||
                    index ===
                        Math.floor(
                            ((audienceData.length -
                                1) *
                                5) /
                                6,
                        ) ||
                    index ===
                        audienceData.length - 1,
            )
            .map(
                (point) =>
                    formatChartDate(
                        point.date,
                    ),
            );

    function formatChartDate(
        date: string,
    ) {
        const [, month, day] =
            date.split("-");

        return `${day}.${month}`;
    }

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

        activityData:
        animatedActivityData,
        activityScaleMax,
        activityYLabels,
        activityTotal,
        activityAverage,

        activityDates,

        audienceDates:
            audienceData.map(
                (point) => point.date,
            ),

        animatedActivityTotal,
        animatedActivityAverage,

        xAxisLabels,
    };
}