import {
    useEffect,
    useRef,
    useState,
} from "react";

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

export function useAnimatedNumber(
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

            const progress = Math.min(elapsed / duration, 1);

            const easedProgress =
                easeOutCubic(progress);

            const nextValue = from + (to - from) * easedProgress;

            setValue(nextValue);

            previousValue.current = nextValue;

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

