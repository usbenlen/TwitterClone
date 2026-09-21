import UsersHero from "@/admin/components/users/UsersHero";
import UsersFilters from "@/admin/components/users/UsersFilters";
import UsersList from "@/admin/components/users/UsersList";

import type { UsersFiltersState } from "@/admin/components/users/types";
import type { User } from "@/types/user";
import UsersPagination from "@/admin/components/users/UsersPagination.tsx";

type UsersProps = {
    items: User[];
    filters: UsersFiltersState;

    currentPage: number;
    totalPages: number;
    totalCount: number;

    onSearchChange: (value: string) => void;

    onSortChange: (
        value: UsersFiltersState["sort"],
    ) => void;

    onStatusChange: (
        value: UsersFiltersState["status"],
    ) => void;

    onOpen: (userId: string) => void;
    onBlock: (user: User) => void;
    onUnblock: (user: User) => void;
    // onDelete: (user: User) => void;
    onPageChange: (page: number) => void;
};

export default function Users({
    items,
    filters,
    currentPage,
    totalPages,
    totalCount,
    onSearchChange,
    onSortChange,
    onStatusChange,
    onOpen,
    onBlock,
    onUnblock,
    onPageChange,
}: UsersProps) {
    return (
        <div className="w-full rounded-xl bg-card border border-border">
            <div className="p-4">
                <UsersHero count={totalCount} />

                <UsersFilters
                    search={filters.search}
                    sort={filters.sort}
                    status={filters.status}
                    onSearchChange={onSearchChange}
                    onSortChange={onSortChange}
                    onStatusChange={onStatusChange}
                />
            </div>

            <UsersList
                items={items}
                onOpen={onOpen}
                onBlock={onBlock}
                onUnblock={onUnblock}
            />

            <UsersPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </div>
    );
}

