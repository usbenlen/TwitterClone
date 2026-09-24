import { useEffect, useState } from "react";

import type { User } from "@/types";
import { usersApi } from "@/admin/api/users.api.ts";

export default function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyAction, setBusyAction] =
        useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadUsers() {
            try {
                setIsLoading(true);
                setError(null);

                const response =
                    await usersApi.getAll();

                if (isMounted) {
                    setUsers(response);
                }
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

        loadUsers();

        return () => {
            isMounted = false;
        };
    }, []);

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
        isLoading,
        error,
        busyAction,
        blockUser,
        unblockUser,
        deleteUser,
    };
}