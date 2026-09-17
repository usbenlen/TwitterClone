import { useState } from "react";

import { Button } from "@/ui";
import { type ModerationItem, statusLabels } from "@/admin/components/moderation/types";
import { ConfirmModal } from "@/components/modal";

import ModerationCard from "./ModerationCard";
import ModerationCardHeader from "./ModerationCardHeader";
import {Ban, CheckCircle} from "lucide-react";

type ModerationUserCardProps = {
    item: Extract<ModerationItem, { type: "users" }>;
    selected: boolean;
    busy: boolean;
    onToggleSelected: () => void;
    onOpen: () => void;
    onKeep: () => void;
    onBlock: () => void;
    onUnblock: () => void;
};

export default function ModerationUserCard({
   item,
   selected,
   busy,
   onOpen,
   onKeep,
   onBlock,
   onUnblock,
}: ModerationUserCardProps) {
    const user = item.subject;

    const [modalAction, setModalAction] = useState<
        "block" | "unblock" | null
    >(null);

    const isBlocked = item.status === "blocked";

    const groupedSignals = Object.values(
        item.signals?.reduce<
            Record<
                string,
                {
                    label: string;
                    count: number;
                }
            >
        >((groups, signal) => {
            const key = signal.reason;

            if (!groups[key]) {
                groups[key] = {
                    label: signal.reasonLabel,
                    count: 0,
                };
            }

            groups[key].count += 1;

            return groups;
        }, {}) ?? {},
    );

    const handleConfirm = () => {
        if (modalAction === "block") {
            onBlock();
        }

        if (modalAction === "unblock") {
            onUnblock();
        }

        setModalAction(null);
    };

    return (
        <>
            <ModerationCard
                selected={selected}
                onOpen={onOpen}
            >
                <div className="min-w-0">
                    <div className="flex items-start">
                        <div
                            className="pt-1"
                            onClick={(event) => event.stopPropagation()}
                        >
                            {/* CHECKBOX */}
                            {/*
                            <input
                                type="checkbox"
                                checked={selected}
                                onChange={onToggleSelected}
                                aria-label="Вибрати користувача"
                                className="size-4 cursor-pointer rounded border-border accent-primary"
                            />
                            */}
                        </div>

                        <ModerationCardHeader
                            avatarUrl={user.avatarUrl}
                            displayName={user.displayName}
                            username={user.username}
                            typeLabel="Користувач"
                            createdAt={user.createdAt}
                        />
                    </div>

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

                    {groupedSignals.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {groupedSignals.map(
                                ({ label, count }) => (
                                    <span
                                        key={label}
                                        className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                                    >
                                        {label}
                                        {count > 1 && ` ×${count}`}
                                    </span>
                                ),
                            )}
                        </div>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                            Статус:
                        </span>

                        <span
                            className={
                                item.status === "blocked"
                                    ? "text-sm font-semibold text-destructive"
                                    : "text-sm font-semibold text-foreground"
                            }
                        >
                            {statusLabels[item.status]}
                        </span>
                    </div>
                </div>

                <div
                    className="flex w-full shrink-0 flex-col gap-2"
                    onClick={(event) => event.stopPropagation()}
                >
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onKeep}
                        isLoading={busy}
                    >
                        Залишити
                    </Button>

                    <Button
                        type="button"
                        variant={isBlocked ? "outline" : "destructive"}
                        size="sm"
                        onClick={() =>
                            setModalAction(
                                isBlocked ? "unblock" : "block",
                            )
                        }
                        isLoading={busy}
                    >
                        {user.isBlocked ? (
                            <CheckCircle className="size-4" />
                        ) : (
                            <Ban className="size-4" />
                        )}

                        {isBlocked ? "Розблокувати" : "Заблокувати"}
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