import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Avatar, Button } from "@/ui";

import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { useUsers } from "@/admin/hooks/users";
import { formatDate } from "@/utils/format";
import ReportCard from "@/admin/components/moderation/report/cards/ReportCard";
import UsersActions from "@/admin/components/users/UsersActions.tsx";

type ConfirmAction =
    | "block"
    | "unblock"
    | "delete"
    | null;

export default function AdminUserPage() {
    const navigate = useNavigate();

    const { userId } = useParams<{
        userId: string;
    }>();

    const {
        users,
        isLoading,
        error,
        busyAction,
        blockUser,
        unblockUser,
        deleteUser,
    } = useUsers();

    const [confirmAction, setConfirmAction] =
        useState<ConfirmAction>(null);

    const user = users.find(
        (item) => item.id === userId,
    );

    if (!user) {
        return (
            <div className="mx-auto w-full max-w-6xl p-6">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="-ml-2"
                >
                    <ArrowLeft className="size-4" />
                    Назад до користувачів
                </Button>

                <div className="mt-8">
                    <h1 className="text-xl font-semibold">
                        Користувач не знайдено
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Користувач з ID{" "}
                        <span className="font-medium">
                            {userId}
                        </span>{" "}
                        не існує.
                    </p>
                </div>
            </div>
        );
    }

    const busy = isLoading || busyAction !== null;

    const handleConfirm = async () => {
        if (!confirmAction) {
            return;
        }

        try {
            if (confirmAction === "block") {
                await blockUser(user);
            }

            if (confirmAction === "unblock") {
                await unblockUser(user);
            }

            if (confirmAction === "delete") {
                await deleteUser(user);
                // navigate("/admin/users");
            }
        } finally {
            setConfirmAction(null);
        }
    };

    const getModalContent = () => {
        switch (confirmAction) {
            case "block":
                return {
                    title: "Заблокувати користувача?",
                    description: "Користувач буде заблокований.",
                    confirmText: "Заблокувати",
                };

            case "unblock":
                return {
                    title: "Розблокувати користувача?",
                    description: "Користувач буде розблокований.",
                    confirmText: "Розблокувати",
                };

            case "delete":
                return {
                    title: "Видалити користувача?",
                    description: "Користувач буде позначений як видалений.",
                    confirmText: "Видалити",
                };

            default:
                return {
                    title: "",
                    description: "",
                    confirmText: "",
                };
        }
    };

    const modalContent = getModalContent();

    return (
        <div className="mx-auto w-full max-w-6xl">
            <header>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="-ml-2"
                >
                    <ArrowLeft className="size-4" />
                    Назад до користувачів
                </Button>

                <div className="mt-5">
                    <h1 className="text-2xl font-semibold">
                        Перегляд користувача
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground font-semibold">
                        ID: {user.id}
                    </p>
                </div>
            </header>

            {error && (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <main className="min-w-0 space-y-6">
                    <ReportCard
                        title="Користувач"
                        openLabel="Відкрити профіль"
                        openHref={`/${user.username}`}
                    >
                        <div className="flex items-start gap-4">
                            <Avatar
                                src={user.avatarUrl}
                                name={user.displayName}
                                fallbackName={user.username}
                                className="size-16 shrink-0"
                            />

                            <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-semibold">
                                    {user.displayName}
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    @{user.username}
                                </p>

                                {user.bio && (
                                    <p className="mt-3 text-sm text-foreground">
                                        {user.bio}
                                    </p>
                                )}
                            </div>

                            <div className="hidden shrink-0 text-right sm:block">
                                <p className="text-xs text-muted-foreground">
                                    Реєстрація
                                </p>

                                <p className="mt-1 text-sm font-medium">
                                    {formatDate(
                                        user.createdAt,
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex gap-8 border-t border-border pt-4">
                            <div>
                                <p className="font-semibold">
                                    {user.postsCount}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    публікацій
                                </p>
                            </div>

                            <div>
                                <p className="font-semibold">
                                    {user.followersCount}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    підписників
                                </p>
                            </div>

                            <div>
                                <p className="font-semibold">
                                    {user.followingCount}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    підписок
                                </p>
                            </div>
                        </div>
                    </ReportCard>
                </main>

                <UsersActions
                    isBlocked={user.isBlocked ?? false}
                    busy={busy}
                    onBlock={() => setConfirmAction("block")}
                    onUnblock={() => setConfirmAction("unblock")}
                    onDelete={() => setConfirmAction("delete")}
                />
            </div>

            <ConfirmModal
                open={confirmAction !== null}
                title={modalContent.title}
                description={modalContent.description}
                confirmText={modalContent.confirmText}
                cancelText="Скасування"
                onCancel={() => {
                    if (!busy) {
                        setConfirmAction(null);
                    }
                }}
                onConfirm={handleConfirm}
            />
        </div>
    );
}