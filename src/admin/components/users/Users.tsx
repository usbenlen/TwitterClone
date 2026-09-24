import {
    UsersHero,
    UsersFilters,
    UsersList,
    UsersPagination
} from "@/admin/components/users";

import type { UsersFiltersState } from "@/admin/types/users";
import type { User } from "@/types/user";

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

    onBlock: (user: User) => Promise<void>;
    onUnblock: (user: User) => Promise<void>;
    onDelete: (user: User) => Promise<void>;

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
    onDelete,
    onPageChange,
}: UsersProps) {
    return (
        <div className="w-full rounded-xl border border-border bg-card">
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
                onDelete={onDelete}
            />

            <UsersPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </div>
    );
}