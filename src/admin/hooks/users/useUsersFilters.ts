import { useMemo, useState } from "react";

import type { User } from "@/types";
import type { UsersFiltersState } from "@/admin/types/users";
import type { UserStatusFilter } from "@/admin/constants/users";

export default function useUsersFilters(users: User[]) {
    const [filters, setFilters] =
        useState<UsersFiltersState>({
            search: "",
            sort: "newest",
            status: "all",
        });

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
        setFilters((previous) => ({
            ...previous,
            search,
        }));
    };

    const setSort = (
        sort: UsersFiltersState["sort"],
    ) => {
        setFilters((previous) => ({
            ...previous,
            sort,
        }));
    };

    const setStatus = (
        status: UserStatusFilter,
    ) => {
        setFilters((previous) => ({
            ...previous,
            status,
        }));
    };

    return {
        filters,
        filteredUsers,
        setSearch,
        setSort,
        setStatus,
    };
}