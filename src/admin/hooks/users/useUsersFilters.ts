import { useState } from "react";

import type { UsersFiltersState } from "@/admin/types/users";
import type { UserStatusFilter } from "@/admin/constants/users";

export default function useUsersFilters() {
    const getInitialFilters =
        (): UsersFiltersState => {
            const params =
                new URLSearchParams(
                    window.location.search,
                );

            const sort =
                params.get("sort") as
                    | UsersFiltersState["sort"]
                    | null;

            const status =
                params.get("status") as
                    | UserStatusFilter
                    | null;

            return {
                search:
                    params.get("search") ?? "",
                sort: sort ?? "newest",
                status: status ?? "all",
            };
        };

    const [filters, setFilters] =
        useState<UsersFiltersState>(
            getInitialFilters,
        );

    const updateUrl = (
        nextFilters: UsersFiltersState,
    ) => {
        const params =
            new URLSearchParams(
                window.location.search,
            );

        params.set("page", "1");

        if (nextFilters.search) {
            params.set(
                "search",
                nextFilters.search,
            );
        } else {
            params.delete("search");
        }

        if (nextFilters.status === "all") {
            params.delete("status");
        } else {
            params.set(
                "status",
                nextFilters.status,
            );
        }

        if (nextFilters.sort === "newest") {
            params.delete("sort");
        } else {
            params.set(
                "sort",
                nextFilters.sort,
            );
        }

        window.history.pushState(
            null,
            "",
            `${window.location.pathname}?${params.toString()}`,
        );
    };

    const setSearch = (search: string) => {
        const nextFilters = {
            ...filters,
            search,
        };

        setFilters(nextFilters);
        updateUrl(nextFilters);
    };

    const setSort = (
        sort: UsersFiltersState["sort"],
    ) => {
        const nextFilters = {
            ...filters,
            sort,
        };

        setFilters(nextFilters);
        updateUrl(nextFilters);
    };

    const setStatus = (
        status: UserStatusFilter,
    ) => {
        const nextFilters = {
            ...filters,
            status,
        };

        setFilters(nextFilters);
        updateUrl(nextFilters);
    };

    return {
        filters,
        setSearch,
        setSort,
        setStatus,
    };
}