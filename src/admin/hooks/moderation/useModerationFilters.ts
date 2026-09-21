import { useMemo, useState } from "react";

import type {
    ModerationItem,
    ModerationSource,
    ModerationSort,
    ModerationStatusFilter,
    ModerationType,
    ModerationFiltersState,
} from "@/admin/types/moderation";

const getLatestSignalTime = (
    item: ModerationItem,
): number => {
    if (item.signals.length === 0) {
        return 0;
    }

    return Math.max(
        ...item.signals.map((signal) =>
            new Date(signal.createdAt).getTime(),
        ),
    );
};

const getActivity = (
    item: ModerationItem,
): number => {
    if (item.type !== "posts") {
        return 0;
    }

    return (
        item.subject.likesCount +
        item.subject.repliesCount +
        item.subject.retweetsCount
    );
};

export function useModerationFilters(
    items: ModerationItem[],
) {
    const [filters, setFilters] =
        useState<ModerationFiltersState>({
            type: "all",
            search: "",
            status: "all",
            sort: "newest",
            source: "all",
        });

    const filteredItems = useMemo(() => {
        const normalizedSearch =
            filters.search.trim().toLowerCase();

        return [...items]
            .filter((item) => {
                if (
                    filters.type !== "all" &&
                    item.type !== filters.type
                ) {
                    return false;
                }

                const matchesStatus = (
                    item: ModerationItem,
                    status: ModerationStatusFilter,
                ): boolean => {
                    switch (status) {
                        case "all":
                            return true;

                        case "pending":
                            return item.status === "pending";

                        case "blocked":
                            return item.status === "blocked";

                        case "deleted":
                            return item.status === "deleted";

                        case "approved":
                            return item.status === "approved";

                        default:
                            return false;
                    }
                };

                if (!matchesStatus(item, filters.status)) {
                    return false;
                }

                if (filters.source !== "all") {
                    const hasSource =
                        item.signals.some(
                            (signal) =>
                                signal.source ===
                                filters.source,
                        );

                    if (!hasSource) {
                        return false;
                    }
                }

                if (!normalizedSearch) {
                    return true;
                }

                if (item.type === "posts") {
                    const content =
                        item.subject.content.toLowerCase();

                    const username =
                        item.subject.author.username.toLowerCase();

                    const displayName = (
                        item.subject.author.displayName ?? "").toLowerCase();

                    return (
                        content.includes(
                            normalizedSearch,
                        ) ||
                        username.includes(
                            normalizedSearch,
                        ) ||
                        displayName.includes(
                            normalizedSearch,
                        )
                    );
                }

                if (item.type === "users") {
                    const username =
                        item.subject.username.toLowerCase();

                    const displayName = (
                        item.subject.displayName ?? "").toLowerCase();

                    return (
                        username.includes(
                            normalizedSearch,
                        ) ||
                        displayName.includes(
                            normalizedSearch,
                        )
                    );
                }

                if (item.type === "comments") {
                    return item.subject.content
                        .toLowerCase()
                        .includes(
                            normalizedSearch,
                        );
                }

                return false;
            })
            .sort((a, b) => {
                switch (filters.sort) {
                    case "oldest":
                        return (
                            getLatestSignalTime(a) -
                            getLatestSignalTime(b)
                        );

                    case "activity":
                        return (
                            getActivity(b) -
                            getActivity(a)
                        );

                    case "newest":
                    default:
                        return (
                            getLatestSignalTime(b) -
                            getLatestSignalTime(a)
                        );
                }
            });
    }, [items, filters]);

    const setSearch = (search: string) => {
        setFilters((previous) => ({
            ...previous,
            search,
        }));
    };

    const setType = (
        type: ModerationType,
    ) => {
        setFilters((previous) => ({
            ...previous,
            type,
        }));
    };

    const setStatus = (
        status: ModerationStatusFilter,
    ) => {
        setFilters((previous) => ({
            ...previous,
            status,
        }));
    };

    const setSort = (
        sort: ModerationSort,
    ) => {
        setFilters((previous) => ({
            ...previous,
            sort,
        }));
    };

    const setSource = (
        source: ModerationSource,
    ) => {
        setFilters((previous) => ({
            ...previous,
            source,
        }));
    };

    return {
        filters,
        filteredItems,
        setSearch,
        setType,
        setStatus,
        setSort,
        setSource,
    };
}