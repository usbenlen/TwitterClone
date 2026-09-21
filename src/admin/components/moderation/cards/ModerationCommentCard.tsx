import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/ui";
import { type ModerationItem, statusLabels } from "@/admin/types/moderation";
import { ConfirmModal } from "@/components/modal";

import ModerationCard from "./ModerationCard";
import ModerationCardHeader from "./ModerationCardHeader";

type ModerationCommentCardProps = {
    item: Extract<ModerationItem, { type: "comments" }>;
    selected: boolean;
    busy: boolean;
    onToggleSelected: () => void;
    onOpen: () => void;
    onKeep: () => void;
    onDelete: () => void;
};

export default function ModerationCommentCard({
    item,
    selected,
    busy,
    onOpen,
    onKeep,
    onDelete,
}: ModerationCommentCardProps) {
    const comment = item.subject;

    const [modalAction, setModalAction] = useState<"delete" | null>(null);

    const groupedSignals = Object.values(
        item.signals.reduce<
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
        }, {}),
    );

    const handleConfirm = () => {
        if (modalAction === "delete") {
            onDelete();
        }

        setModalAction(null);
    };

    const isDeleted = item.status === "deleted";

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
                            {/* Checkbox */}
                            {/*
                            <input
                                type="checkbox"
                                checked={selected}
                                onChange={onToggleSelected}
                                aria-label="Вибрати коментар"
                                className="size-4 cursor-pointer rounded border-border accent-primary"
                            />
                            */}
                        </div>

                        <ModerationCardHeader
                            avatarUrl={comment.author.avatarUrl}
                            displayName={comment.author.displayName}
                            username={comment.author.username}
                            typeLabel="Коментар"
                            createdAt={comment.createdAt}
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                            {comment.content}
                        </p>
                    </div>

                    <div>
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>
                                {comment.likesCount} лайків
                            </span>

                            <span>
                                {comment.repliesCount} відповідей
                            </span>

                            <span>
                                {comment.retweetsCount} репостів
                            </span>
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
                                    item.status === "deleted"
                                        ? "text-sm font-semibold text-destructive"
                                        : "text-sm font-semibold text-foreground"
                                }
                            >
                                {statusLabels[item.status]}
                            </span>
                        </div>
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
                        variant={isDeleted ? "outline" : "destructive"}
                        size="sm"
                        onClick={() => setModalAction("delete")}
                        isLoading={busy}
                        disabled={isDeleted}
                    >
                        <Trash2 className="size-4" />
                        Видалити
                    </Button>
                </div>
            </ModerationCard>

            <ConfirmModal
                open={modalAction === "delete"}
                title="Видалити коментар?"
                description="Коментар буде видалений. Цю дію неможливо скасувати."
                confirmText="Видалити"
                cancelText="Скасувати"
                onCancel={() => setModalAction(null)}
                onConfirm={handleConfirm}
            />
        </>
    );
}