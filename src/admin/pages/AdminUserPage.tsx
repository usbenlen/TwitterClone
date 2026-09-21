import { useState } from "react";
import { ArrowLeft, Ban, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { Avatar, Button } from "@/ui";

import { sampleAuthors } from "@/mock/data/users";

import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { useModeration } from "@/admin/hooks/moderation/useModeration";
import {formatDate} from "@/utils/format.ts";
import ReportCard from "@/admin/components/moderation/report/cards/ReportCard.tsx";

type ConfirmAction =
    | "block"
    | "delete"
    | null;

export default function AdminUserPage() {
    const navigate = useNavigate();

    const { userId } = useParams<{
        userId: string;
    }>();

    const {
        items,
        isLoading,
        error,
        busyAction,
        blockItem,
        deleteItem,
    } = useModeration();

    const [confirmAction, setConfirmAction] =
        useState<ConfirmAction>(null);

    const user = sampleAuthors.find(
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
                        не існує..
                    </p>
                </div>
            </div>
        );
    }

    const moderationItem = items.find(
        (item) =>
            item.type === "users" &&
            item.id === user.id,
    );

    const busy =
        isLoading ||
        busyAction !== null;

    const handleConfirm = async () => {
        if (!moderationItem || !confirmAction) {
            return;
        }

        try {
            if (confirmAction === "block") {
                await blockItem(moderationItem);
            }

            if (confirmAction === "delete") {
                await deleteItem(moderationItem);
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
                    description: "Користувач буде заблоковано.",
                    confirmText: "Заблокувати",
                };

            case "delete":
                return {
                    title: "Видалити користувача?",
                    description: "Користувач буде позначений як віддалений.",
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
                        Користувач
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
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
                                    {formatDate(user.createdAt)}
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

                <aside className="lg:sticky lg:top-6 lg:self-start">
                    <section className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="text-lg font-semibold">
                            Дії
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Керування обліковим записом користувача.
                        </p>

                        <div className="mt-5 space-y-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start"
                                // disabled={busy || !moderationItem}
                                onClick={() =>
                                    setConfirmAction("block")
                                }
                            >
                                <Ban className="size-4" />
                                Заблокувати
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                className="w-full justify-start"
                                // disabled={busy || !moderationItem}
                                onClick={() =>
                                    setConfirmAction("delete")
                                }
                            >
                                <Trash2 className="size-4" />
                                Видалити
                            </Button>
                        </div>

                        <div className="mt-5 border-t border-border pt-4">
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Статус
                            </p>

                            <p className={
                                   user.isBlocked
                                       ? "text-sm font-semibold text-destructive"
                                       : "text-sm font-semibold text-foreground"
                               }
                            >
                                {user.isBlocked ? "Заблокований" : "Активний"}
                            </p>
                        </div>
                    </section>
                </aside>
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