import { useState } from "react";
import { ConfirmModal } from "@/components/modal";
import ModerationCardHeader from "@/admin/components/moderation/cards/ModerationCardHeader";

import {
    UsersCardStatus,
    UsersCardStats,
    UsersCardActions,
} from "@/admin/components/users/cards/ui";

import type { User } from "@/types/user";

type UserCardProps = {
    user: User;
    selected?: boolean;
    busy?: boolean;
    onOpen: () => void;
    onBlock: () => Promise<void>;
    onUnblock: () => Promise<void>;
    onDelete: () => Promise<void>;
};

export default function UsersCard({
    user,
    selected = false,
    busy = false,
    onOpen,
    onBlock,
    onUnblock,
    onDelete,
}: UserCardProps) {
    const [modalAction, setModalAction] = useState<
        "block" | "unblock" | "delete" | null
    >(null);

    const [localIsBlocked, setLocalIsBlocked] =
        useState(user.isBlocked ?? false);

    const isBlocked = localIsBlocked;

    const handleConfirm = async () => {
        if (modalAction === "block") {
            await onBlock();
            setLocalIsBlocked(true);
        }

        if (modalAction === "unblock") {
            await onUnblock();
            setLocalIsBlocked(false);
        }

        if (modalAction === "delete") {
            await onDelete();
            setLocalIsBlocked(false);
        }

        setModalAction(null);
    };

    return (
        <>
            <article
                onClick={onOpen}
                className={`grid w-full grid-cols-[minmax(0,1fr)_auto] gap-6 border-t p-4 ${
                    selected
                        ? "bg-primary/10 ring-1 ring-inset ring-primary/30"
                        : "cursor-pointer hover:bg-muted/30"
                }`}
            >
                <div className="min-w-0">
                    <ModerationCardHeader
                        avatarUrl={user.avatarUrl}
                        displayName={user.displayName}
                        username={user.username}
                        typeLabel="Користувач"
                        createdAt={user.createdAt}
                    />

                    <UsersCardStats
                        followersCount={user.followersCount}
                        followingCount={user.followingCount}
                    />

                    <UsersCardStatus
                        isBlocked={isBlocked}
                    />
                </div>

                <UsersCardActions
                    isBlocked={isBlocked}
                    busy={busy}
                    onBlock={() => setModalAction("block")}
                    onUnblock={() => setModalAction("unblock")}
                    onDelete={() => setModalAction("delete")}
                />
            </article>

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
                onCancel={() =>
                    setModalAction(null)
                }
                onConfirm={handleConfirm}
            />
        </>
    );
}