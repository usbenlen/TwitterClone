import { useMemo, useState } from "react";

import type {
    ReportDecision,
    ReportSignal,
    ReportSignalSource,
    ReportStatus,
    ReportTargetType,
} from "@/admin/types/moderation";

export type ReportSort =
    | "newest"
    | "oldest";

export type ReportFiltersState = {
    type: ReportTargetType | "all";
    search: string;
    source: ReportSignalSource | "all";
    status: ReportStatus | "all";
    decision: ReportDecision | "all";
    sort: ReportSort;
};

export default function useModerationFilters(
    items: ReportSignal[],
) {
    const [filters, setFilters] =
        useState<ReportFiltersState>({
            type: "all",
            search: "",
            source: "all",
            status: "all",
            decision: "all",
            sort: "newest",
        });

    const filteredItems = useMemo(() => {
        const normalizedSearch =
            filters.search.trim().toLowerCase();

        return [...items]
            .filter((item) => {
                if (
                    filters.type !== "all" &&
                    item.targetType !== filters.type
                ) {
                    return false;
                }

                if (
                    filters.source !== "all" &&
                    item.source !== filters.source
                ) {
                    return false;
                }

                if (
                    filters.status !== "all" &&
                    item.status !== filters.status
                ) {
                    return false;
                }

                if (
                    filters.decision !== "all" &&
                    item.decision !== filters.decision
                ) {
                    return false;
                }

                if (!normalizedSearch) {
                    return true;
                }

                const reason = item.reasonLabel.toLowerCase();

                const username = item.reporter?.username.toLowerCase() ?? "";

                const system = item.system?.label.toLowerCase() ?? "";

                return (
                    reason.includes(
                        normalizedSearch,
                    ) ||
                    username.includes(
                        normalizedSearch,
                    ) ||
                    system.includes(
                        normalizedSearch,
                    ) ||
                    item.targetId
                        .toLowerCase()
                        .includes(
                            normalizedSearch,
                    )
                );
            })
            .sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();

                switch (filters.sort) {
                    case "oldest":
                        return dateA - dateB;

                    case "newest":
                    default:
                        return dateB - dateA;
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
        type: ReportTargetType | "all",
    ) => {
        setFilters((previous) => ({
            ...previous,
            type,
        }));
    };

    const setSource = (
        source: ReportSignalSource | "all",
    ) => {
        setFilters((previous) => ({
            ...previous,
            source,
        }));
    };

    const setStatus = (
        status: ReportStatus | "all",
    ) => {
        setFilters((previous) => ({
            ...previous,
            status,
        }));
    };

    const setDecision = (
        decision: ReportDecision | "all",
    ) => {
        setFilters((previous) => ({
            ...previous,
            decision,
        }));
    };

    const setSort = (
        sort: ReportSort,
    ) => {
        setFilters((previous) => ({
            ...previous,
            sort,
        }));
    };

    return {
        filters,
        filteredItems,
        setSearch,
        setType,
        setSource,
        setStatus,
        setDecision,
        setSort,
    };
}