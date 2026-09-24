import { useMemo, useState } from "react";

export default function useModerationSelection<T>(
    items: T[],
    getKey: (item: T) => string,
) {
    const [selectedIds, setSelectedIds] =
        useState<string[]>([]);

    const allCurrentPageSelected = useMemo(() => {
        if (items.length === 0) {
            return false;
        }

        return items.every((item) =>
            selectedIds.includes(getKey(item)),
        );
    }, [items, selectedIds, getKey]);

    const toggleSelected = (item: T) => {
        const key = getKey(item);

        setSelectedIds((previous) =>
            previous.includes(key)
                ? previous.filter(
                    (selectedId) =>
                        selectedId !== key,
                )
                : [...previous, key],
        );
    };

    const toggleSelectAll = () => {
        const currentPageKeys = items.map(getKey);

        if (currentPageKeys.length === 0) {
            return;
        }

        const allSelected =
            currentPageKeys.every((key) =>
                selectedIds.includes(key),
            );

        if (allSelected) {
            setSelectedIds((previous) =>
                previous.filter(
                    (id) =>
                        !currentPageKeys.includes(id),
                ),
            );

            return;
        }

        setSelectedIds((previous) => [
            ...new Set([
                ...previous,
                ...currentPageKeys,
            ]),
        ]);
    };

    const clearSelection = () => {
        setSelectedIds([]);
    };

    const removeSelected = (item: T) => {
        const key = getKey(item);

        setSelectedIds((previous) =>
            previous.filter(
                (selectedId) =>
                    selectedId !== key,
            ),
        );
    };

    return {
        selectedIds,
        allCurrentPageSelected,
        toggleSelected,
        toggleSelectAll,
        clearSelection,
        removeSelected,
    };
}