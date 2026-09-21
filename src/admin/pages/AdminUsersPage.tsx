import { useNavigate } from "react-router";

import { useUsers } from "@/admin/hooks/users/useUsers.ts";
import { useUsersFilters } from "@/admin/hooks/users/useUsersFilters.ts";
import { useUsersPagination } from "@/admin/hooks/users/useUsersPagination.ts";

import Users from "@/admin/components/users/Users";
import { Spinner } from "@/ui";
import type { User } from "@/types";

export default function AdminUsersPage() {
    const navigate = useNavigate();

    const {
        users,
        isLoading,
        blockUser,
        unblockUser,
        // deleteUser,
    } = useUsers();

    const {
        filteredUsers,
        filters,
        setSearch,
        setSort,
        setStatus,
    } = useUsersFilters(users);

    const {
        currentPage,
        totalPages,
        paginatedItems: paginatedUsers,
        goToPage,
        resetPage,
    } = useUsersPagination(filteredUsers);

    const handleOpen = (userId: string) => {
        navigate(`/admin/users/${userId}`);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        resetPage();
    };

    const handleSortChange = (
        value: typeof filters.sort,
    ) => {
        setSort(value);
        resetPage();
    };

    const handleStatusChange = (
        value: typeof filters.status,
    ) => {
        setStatus(value);
        resetPage();
    };

    const handleBlock = async (user: User) => {
        await blockUser(user);
    };

    const handleUnblock = async (user: User) => {
        await unblockUser(user);
    };

    // const handleDelete = async (user: User) => {
    //     await deleteUser(user);
    // };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div className="w-full">
            <Users
                items={paginatedUsers}
                filters={filters}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={filteredUsers.length}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onStatusChange={handleStatusChange}
                onOpen={handleOpen}
                onBlock={handleBlock}
                onUnblock={handleUnblock}
                // onDelete={handleDelete}
                onPageChange={goToPage}
            />
        </div>
    );
}