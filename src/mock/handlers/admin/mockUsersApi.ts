import { sampleAuthors } from "@/mock/data/users";

import type {
    UsersListParams,
    UsersListResponse,
} from "@/admin/types/users";

export const mockUsersApi = {
    async getAll(
        params: UsersListParams = {},
    ): Promise<UsersListResponse> {
        let users = [...sampleAuthors];

        const normalizedSearch =
            params.search?.trim().toLowerCase() ?? "";

        if (normalizedSearch) {
            users = users.filter((user) => {
                const username =
                    user.username?.toLowerCase() ?? "";

                const displayName =
                    user.displayName?.toLowerCase() ?? "";

                const email =
                    user.email?.toLowerCase() ?? "";

                return (
                    username.includes(
                        normalizedSearch,
                    ) ||
                    displayName.includes(
                        normalizedSearch,
                    ) ||
                    email.includes(
                        normalizedSearch,
                    )
                );
            });
        }

        if (
            params.status &&
            params.status !== "all"
        ) {
            if (params.status === "blocked") {
                users = users.filter(
                    (user) => user.isBlocked,
                );
            }

            if (params.status === "active") {
                users = users.filter(
                    (user) => !user.isBlocked,
                );
            }
        }

        users.sort((a, b) => {
            const dateA = new Date(
                a.createdAt,
            ).getTime();

            const dateB = new Date(
                b.createdAt,
            ).getTime();

            return params.sort === "oldest"
                ? dateA - dateB
                : dateB - dateA;
        });

        const total = users.length;
        const limit = 10;

        const safePage = Math.max(
            params.page ?? 1,
            1,
        );

        const totalPages = Math.max(
            1,
            Math.ceil(total / limit),
        );

        const page = Math.min(
            safePage,
            totalPages,
        );

        const start =
            (page - 1) * limit;

        const items = users.slice(
            start,
            start + limit,
        );

        return {
            items,
            pagination: {
                page,
                total,
                totalPages,
            },
        };
    },

    async block(userId: string): Promise<void> {
        const user = sampleAuthors.find(
            (currentUser) =>
                currentUser.id === userId,
        );

        if (!user) {
            throw new Error(
                "Користувача не знайдено",
            );
        }

        user.isBlocked = true;
    },

    async unblock(userId: string): Promise<void> {
        const user = sampleAuthors.find(
            (currentUser) =>
                currentUser.id === userId,
        );

        if (!user) {
            throw new Error(
                "Користувача не знайдено",
            );
        }

        user.isBlocked = false;
    },

    async delete(userId: string): Promise<void> {
        const index = sampleAuthors.findIndex(
            (currentUser) =>
                currentUser.id === userId,
        );

        if (index === -1) {
            throw new Error(
                "Користувача не знайдено",
            );
        }

        sampleAuthors.splice(index, 1);
    },
};