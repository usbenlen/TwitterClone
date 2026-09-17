import { useState } from "react";
import { Ban, CheckCircle } from "lucide-react";

import { ConfirmModal } from "@/components/modal";
import { Button } from "@/ui";

import ModerationCard from "@/admin/components/moderation/cards/ModerationCard";
import ModerationCardHeader from "@/admin/components/moderation/cards/ModerationCardHeader";

import type { User } from "@/types/user";

type UserCardProps = {
    user: User;

    selected?: boolean;
    busy?: boolean;

    onOpen: (userId: string) => void;
    onBlock: (user: User) => void;
    onUnblock: (user: User) => void;
};

export default function UserCard({
    user,
    selected = false,
    busy = false,
    onOpen,
    onBlock,
    onUnblock,
}: UserCardProps) {
    const [modalAction, setModalAction] = useState<
        "block" | "unblock" | null
    >(null);

    const handleConfirm = () => {
        if (modalAction === "block") {
            onBlock(user);
        }

        if (modalAction === "unblock") {
            onUnblock(user);
        }

        setModalAction(null);
    };

    return (
        <>
            <ModerationCard
                selected={selected}
                onOpen={() => onOpen(user.id)}
            >
                <div className="min-w-0">
                    <ModerationCardHeader
                        avatarUrl={user.avatarUrl}
                        displayName={user.displayName}
                        username={user.username}
                        typeLabel="Користувач"
                        createdAt={user.createdAt}
                    />

                    <div className="mt-3 min-w-0">
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>
                                {user.followersCount} підписників
                            </span>

                            <span>
                                {user.followingCount} підписок
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                            Статус:
                        </span>

                        <span
                            className={
                                user.isBlocked
                                    ? "text-sm font-semibold text-destructive"
                                    : "text-sm font-semibold text-foreground"
                            }
                        >
                            {user.isBlocked ? "Заблокований" : "Активний"}
                        </span>
                    </div>
                </div>

                <div
                    className="flex w-full shrink-0 flex-col gap-2"
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                >
                    <Button
                        type="button"
                        variant={
                            user.isBlocked
                                ? "outline"
                                : "destructive"
                        }
                        size="sm"
                        onClick={() =>
                            setModalAction(
                                user.isBlocked
                                    ? "unblock"
                                    : "block",
                            )
                        }
                        isLoading={busy}
                    >
                        {user.isBlocked ? (
                            <CheckCircle className="size-4" />
                        ) : (
                            <Ban className="size-4" />
                        )}

                        {user.isBlocked
                            ? "Розблокувати"
                            : "Заблокувати"}
                    </Button>
                </div>
            </ModerationCard>

            <ConfirmModal
                open={modalAction !== null}
                title={
                    modalAction === "block"
                        ? "Заблокувати користувача?"
                        : "Розблокувати користувача?"
                }
                description={
                    modalAction === "block"
                        ? `Користувач @${user.username} буде заблокований.`
                        : `Користувач @${user.username} буде розблокований.`
                }
                confirmText={
                    modalAction === "block"
                        ? "Заблокувати"
                        : "Розблокувати"
                }
                cancelText="Скасувати"
                onCancel={() => setModalAction(null)}
                onConfirm={handleConfirm}
            />
        </>
    );
}