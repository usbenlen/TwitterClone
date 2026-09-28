import type { User } from "@/types";

export type AdminUser = User;

export type UsersStatusFilter =
    | "all"
    | "active"
    | "blocked";

export type UsersSort =
    | "newest"
    | "oldest";

export type UsersListParams = {
    page?: number;
    search?: string;
    status?: UsersStatusFilter;
    sort?: UsersSort;
};

export type UsersListResponse = {
    items: AdminUser[];
    pagination: {
        page: number;
        total: number;
        totalPages: number;
    };
};

export type UsersFiltersState = {
    search: string;
    sort: UsersSort;
    status: UsersStatusFilter;
};