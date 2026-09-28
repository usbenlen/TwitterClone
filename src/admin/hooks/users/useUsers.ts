import { useEffect, useState } from "react";

import type { User } from "@/types";
import { usersApi } from "@/admin/api/users.api.ts";

import type {
    UsersFiltersState,
} from "@/admin/types/users";

export default function useUsers(
    page = 1,
    filters: UsersFiltersState = {
        search: "",
        sort: "newest",
        status: "all",
    },
) {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] =
        useState({
            page: 1,
            total: 0,
            totalPages: 1,
        });

    const [isLoading, setIsLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    const [busyAction, setBusyAction] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadUsers() {
            try {
                setIsLoading(true);
                setError(null);

                const response =
                    await usersApi.getAll({
                        page,
                        search: filters.search,
                        status: filters.status,
                        sort: filters.sort,
                    });

                if (!isMounted) {
                    return;
                }

                setUsers(response.items);
                setPagination(response.pagination);
            } catch {
                if (isMounted) {
                    setError(
                        "Не вдалося завантажити користувачів.",
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadUsers();

        return () => {
            isMounted = false;
        };
    }, [
        page,
        filters.search,
        filters.status,
        filters.sort,
    ]);

    const blockUser = async (user: User) => {
        try {
            setBusyAction(`user:${user.id}`);
            setError(null);

            await usersApi.block(user.id);

            setUsers((previousUsers) =>
                previousUsers.map((currentUser) =>
                    currentUser.id === user.id
                        ? {
                            ...currentUser,
                            isBlocked: true,
                        }
                        : currentUser,
                ),
            );
        } catch {
            setError(
                "Не вдалося заблокувати користувача.",
            );
        } finally {
            setBusyAction(null);
        }
    };

    const unblockUser = async (user: User) => {
        try {
            setBusyAction(`user:${user.id}`);
            setError(null);

            await usersApi.unblock(user.id);

            setUsers((previousUsers) =>
                previousUsers.map((currentUser) =>
                    currentUser.id === user.id
                        ? {
                            ...currentUser,
                            isBlocked: false,
                        }
                        : currentUser,
                ),
            );
        } catch {
            setError(
                "Не вдалося розблокувати користувача.",
            );
        } finally {
            setBusyAction(null);
        }
    };

    const deleteUser = async (user: User) => {
        try {
            setBusyAction(`user:${user.id}`);
            setError(null);

            await usersApi.delete(user.id);

            setUsers((previousUsers) =>
                previousUsers.filter(
                    (currentUser) =>
                        currentUser.id !== user.id,
                ),
            );
        } catch {
            setError(
                "Не вдалося видалити користувача.",
            );
        } finally {
            setBusyAction(null);
        }
    };

    return {
        users,
        pagination,
        isLoading,
        error,
        busyAction,
        blockUser,
        unblockUser,
        deleteUser,
    };
}