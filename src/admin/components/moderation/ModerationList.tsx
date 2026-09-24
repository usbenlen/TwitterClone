import ModerationCommentCard from "./cards/ModerationCommentCard";
import ModerationPostCard from "./cards/ModerationPostCard";
import ModerationUserCard from "./cards/ModerationUserCard";

import type { ReportSignal } from "@/admin/types/moderation";

import { Button } from "@/ui";

import { tweets } from "@/mock/data/tweets";
import { commentsByPostId } from "@/mock/data/comments";
import { sampleAuthors } from "@/mock/data/users";

type ModerationListProps = {
    items: ReportSignal[];
    selectedIds: string[];
    busyAction: string | null;

    allCurrentPageSelected: boolean;

    onToggleSelected: (item: ReportSignal) => void;
    onToggleSelectAll: () => void;
    onClearSelection: () => void;
    onBlockSelected: () => void;

    onOpen: (item: ReportSignal) => void;

    onKeep: (item: ReportSignal) => void;
    onDelete: (item: ReportSignal) => void;
    onBlock: (item: ReportSignal) => void;
};

export default function ModerationList({
   items,
   selectedIds,
   busyAction,
   allCurrentPageSelected,
   onToggleSelected,
   onToggleSelectAll,
   onClearSelection,
   onBlockSelected,
   onOpen,
   onKeep,
   onDelete,
   onBlock,
}: ModerationListProps) {
    return (
        <div>
            <div className="pb-4 pl-4 pr-4 pt-2">
                {selectedIds.length > 0 ? (
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <input
                                type="checkbox"
                                checked={allCurrentPageSelected}
                                onChange={onToggleSelectAll}
                                aria-label="Вибрати всі елементи"
                                className="size-4 shrink-0 cursor-pointer rounded border-muted/10 accent-primary"
                            />

                            <span className="text-sm font-semibold text-foreground">
                                Вибрано: {selectedIds.length}
                            </span>

                            <button
                                type="button"
                                onClick={onClearSelection}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Зняти виділення
                            </button>
                        </div>

                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={onBlockSelected}
                            isLoading={
                                busyAction === "bulk:block"
                            }
                        >
                            Заблокувати вибрані
                        </Button>
                    </div>
                ) : (
                    <div className="grid w-full grid-cols-[minmax(0,1fr)_17rem] items-center gap-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Контент і користувач
                        </div>

                        <div className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Дії
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full">
                {items.map((item) => {
                    const itemKey = item.id;

                    const busy =
                        busyAction === `item:${item.targetType}:${item.targetId}`;

                    const selected =
                        selectedIds.includes(itemKey);

                    switch (item.targetType) {
                        case "posts": {
                            const post = tweets.find(
                                (currentPost) =>
                                    currentPost.id ===
                                    item.targetId,
                            );

                            if (!post) {
                                return null;
                            }

                            return (
                                <ModerationPostCard
                                    key={itemKey}
                                    item={item}
                                    post={post}
                                    selected={selected}
                                    busy={busy}
                                    onToggleSelected={() => onToggleSelected(item)}
                                    onOpen={() => onOpen(item)}
                                    onKeep={() => onKeep(item)}
                                    onDelete={() => onDelete(item)}
                                />
                            );
                        }

                        case "comments": {
                            const comment = Object.values(
                                commentsByPostId,
                            )
                                .flat()
                                .find(
                                    (currentComment) =>
                                        currentComment.id === item.targetId,
                                    );

                            if (!comment) {
                                return null;
                            }

                            return (
                                <ModerationCommentCard
                                    key={itemKey}
                                    item={item}
                                    comment={comment}
                                    selected={selected}
                                    busy={busy}
                                    onToggleSelected={() => onToggleSelected(item)}
                                    onOpen={() => onOpen(item)}
                                    onKeep={() => onKeep(item)}
                                    onDelete={() => onDelete(item)}
                                />
                            );
                        }

                        case "users": {
                            const user =
                                sampleAuthors.find(
                                    (currentUser) =>
                                        currentUser.id === item.targetId,
                                );

                            if (!user) {
                                return null;
                            }

                            return (
                                <ModerationUserCard
                                    key={itemKey}
                                    item={item}
                                    user={user}
                                    selected={selected}
                                    busy={busy}
                                    onToggleSelected={() => onToggleSelected(item)}
                                    onOpen={() => onOpen(item)}
                                    onKeep={() => onKeep(item)}
                                    onBlock={() => onBlock(item)}
                                />
                            );
                        }

                        default:
                            return null;
                    }
                })}

                {items.length === 0 && (
                    <div className="p-10 text-center">
                        <p className="text-sm font-medium text-foreground">
                            Нічого не знайдено
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Спробуйте змінити фільтри або пошуковий запит.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}