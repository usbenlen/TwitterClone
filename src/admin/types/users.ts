import type { User } from "@/types";

export type AdminUser = User;

export type UserStatusFilter =
    | "all"
    | "active"
    | "blocked"
    | "admin";

export type UserDateSort =
    | "newest"
    | "oldest";