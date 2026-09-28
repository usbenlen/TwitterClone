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
    const getInitialFilters = (): ReportFiltersState => {
        const params = new URLSearchParams(
            window.location.search,
        );

        const type =
            params.get("type") as
                | ReportTargetType
                | null;

        const source =
            params.get("source") as
                | ReportSignalSource
                | null;

        const status =
            params.get("status") as
                | ReportStatus
                | null;

        const decision =
            params.get("decision") as
                | ReportDecision
                | null;

        const sort =
            params.get("sort") as
                | ReportSort
                | null;

        return {
            type: type ?? "all",
            search: params.get("search") ?? "",
            source: source ?? "all",
            status: status ?? "all",
            decision: decision ?? "all",
            sort: sort ?? "newest",
        };
    };

    const [filters, setFilters] =
        useState<ReportFiltersState>(
            getInitialFilters,
        );

    const updateUrl = (
        nextFilters: ReportFiltersState,
    ) => {
        const params = new URLSearchParams(
            window.location.search,
        );

        params.set("page", "1");

        if (nextFilters.type === "all") {
            params.delete("type");
        } else {
            params.set("type", nextFilters.type);
        }

        if (nextFilters.search) {
            params.set(
                "search",
                nextFilters.search,
            );
        } else {
            params.delete("search");
        }

        if (nextFilters.source === "all") {
            params.delete("source");
        } else {
            params.set(
                "source",
                nextFilters.source,
            );
        }

        if (nextFilters.status === "all") {
            params.delete("status");
        } else {
            params.set(
                "status",
                nextFilters.status,
            );
        }

        if (nextFilters.decision === "all") {
            params.delete("decision");
        } else {
            params.set(
                "decision",
                nextFilters.decision,
            );
        }

        if (nextFilters.sort === "newest") {
            params.delete("sort");
        } else {
            params.set("sort", nextFilters.sort);
        }

        window.history.pushState(
            null,
            "",
            `${window.location.pathname}?${params.toString()}`,
        );
    };

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

                const reason =
                    item.reasonLabel.toLowerCase();

                const username =
                    item.reporter?.username.toLowerCase() ?? "";

                const system =
                    item.system?.label.toLowerCase() ?? "";

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
                const dateA =
                    new Date(a.createdAt).getTime();

                const dateB =
                    new Date(b.createdAt).getTime();

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
        const nextFilters = {
            ...filters,
            search,
        };

        setFilters(nextFilters);
        updateUrl(nextFilters);
    };

    const setType = (
        type: ReportTargetType | "all",
    ) => {
        const nextFilters = {
            ...filters,
            type,
        };

        setFilters(nextFilters);
        updateUrl(nextFilters);
    };

    const setSource = (
        source: ReportSignalSource | "all",
    ) => {
        const nextFilters = {
            ...filters,
            source,
        };

        setFilters(nextFilters);
        updateUrl(nextFilters);
    };

    const setStatus = (
        status: ReportStatus | "all",
    ) => {
        const nextFilters = {
            ...filters,
            status,
        };

        setFilters(nextFilters);
        updateUrl(nextFilters);
    };

    const setDecision = (
        decision: ReportDecision | "all",
    ) => {
        const nextFilters = {
            ...filters,
            decision,
        };

        setFilters(nextFilters);
        updateUrl(nextFilters);
    };

    const setSort = (
        sort: ReportSort,
    ) => {
        const nextFilters = {
            ...filters,
            sort,
        };

        setFilters(nextFilters);
        updateUrl(nextFilters);
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