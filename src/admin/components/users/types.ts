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
