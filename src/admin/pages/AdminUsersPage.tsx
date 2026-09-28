import { useNavigate } from "react-router";

import {
    useUsers,
    useUsersFilters,
    useUsersPagination,
} from "@/admin/hooks/users";

import Users from "@/admin/components/users/Users";

import type { User } from "@/types";

export default function AdminUsersPage() {
    const navigate = useNavigate();

    const params = new URLSearchParams(
        window.location.search,
    );

    const pageParam = Number(
        params.get("page"),
    );

    const currentPageFromUrl =
        Number.isFinite(pageParam) &&
        pageParam > 0
            ? pageParam
            : 1;

    const {
        filters,
        setSearch,
        setSort,
        setStatus,
    } = useUsersFilters();

    const {
        users,
        pagination,
        // isLoading,
        blockUser,
        unblockUser,
        deleteUser,
    } = useUsers(
        currentPageFromUrl,
        filters,
    );

    const {
        currentPage,
        totalPages,
        goToPage,
        resetPage,
    } = useUsersPagination(
        pagination.totalPages,
    );

    const handleOpen = (userId: string) => {
        navigate(`/admin/users/${userId}`);
    };

    const handleSearchChange = (
        value: string,
    ) => {
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

    const handleBlock = async (
        user: User,
    ) => {
        await blockUser(user);
    };

    const handleUnblock = async (
        user: User,
    ) => {
        await unblockUser(user);
    };

    const handleDelete = async (
        user: User,
    ) => {
        await deleteUser(user);
    };

    return (
        <div className="w-full">
            <Users
                items={users}
                filters={filters}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={pagination.total}
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onStatusChange={handleStatusChange}
                onOpen={handleOpen}
                onBlock={handleBlock}
                onUnblock={handleUnblock}
                onDelete={handleDelete}
                onPageChange={goToPage}
            />
        </div>
    );
}