import type { User } from "@/types";

export type AdminUser = User;

export type UsersStatusFilter =
    | "all"
    | "active"
    | "blocked"
    | "admin";

export type UsersDateSort =
    | "newest"
    | "oldest";

export type UsersSort =
    | "newest"
    | "oldest";

export type UsersStatus =
    | "all"
    | "active"
    | "blocked";

export type UsersFiltersState = {
    search: string;
    sort: UsersSort;
    status: UsersStatus;
};
