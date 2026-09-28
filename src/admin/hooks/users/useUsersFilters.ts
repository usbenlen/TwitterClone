import { useMemo, useState } from "react";

import type { User } from "@/types";
import type { UsersFiltersState } from "@/admin/types/users";
import type { UserStatusFilter } from "@/admin/constants/users";

export default function useUsersFilters(users: User[]) {
    const getInitialFilters = (): UsersFiltersState => {
        const params = new URLSearchParams(
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
            search: params.get("search") ?? "",
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
        const params = new URLSearchParams(
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
            null, "", `${window.location.pathname}?${params.toString()}`,
        );
    };

    const filteredUsers = useMemo(() => {
        const normalizedSearch =
            filters.search.trim().toLowerCase();

        return [...users]
            .filter((user) => {
                switch (filters.status) {
                    case "active":
                        if (user.isBlocked) {
                            return false;
                        }
                        break;

                    case "blocked":
                        if (!user.isBlocked) {
                            return false;
                        }
                        break;

                    case "all":
                    default:
                        break;
                }

                if (normalizedSearch) {
                    const username =
                        user.username.toLowerCase();

                    const displayName =
                        (
                            user.displayName ?? ""
                        ).toLowerCase();

                    if (
                        !username.includes(
                            normalizedSearch,
                        ) &&
                        !displayName.includes(
                            normalizedSearch,
                        )
                    ) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => {
                switch (filters.sort) {
                    case "oldest":
                        return (
                            new Date(a.createdAt).getTime() -
                            new Date(b.createdAt).getTime()
                        );

                    case "newest":
                    default:
                        return (
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        );
                }
            });
    }, [users, filters]);

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
        filteredUsers,
        setSearch,
        setSort,
        setStatus,
    };
}
