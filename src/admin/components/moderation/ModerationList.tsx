import ModerationCommentCard from "./cards/ModerationCommentCard";
import ModerationPostCard from "./cards/ModerationPostCard";
import ModerationUserCard from "./cards/ModerationUserCard";

import type {ModerationItem} from "@/admin/components/moderation/types.ts";

import { Button } from "@/ui";

type ModerationListProps = {
    items: ModerationItem[];
    selectedIds: string[];
    busyAction: string | null;

    allCurrentPageSelected: boolean;

    onToggleSelected: (item: ModerationItem) => void;
    onToggleSelectAll: () => void;
    onClearSelection: () => void;
    onBlockSelected: () => void;

    onOpen: (
        type: ModerationItem["type"],
        itemId: string,
    ) => void;

    onKeep: (item: ModerationItem) => void;
    onDelete: (item: ModerationItem) => void;
    onBlock: (item: ModerationItem) => void;
    onUnblock: (item: ModerationItem) => void;
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
   onUnblock,
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
                    const itemKey = `${item.type}:${item.id}`;

                    const busy =
                        busyAction === `item:${itemKey}`;

                    const selected =
                        selectedIds.includes(itemKey);

                    switch (item.type) {
                        case "posts":
                            return (
                                <ModerationPostCard
                                    key={itemKey}
                                    item={item}
                                    selected={selected}
                                    busy={busy}
                                    onToggleSelected={() => onToggleSelected(item)}
                                    onOpen={() => onOpen(item.type, item.id)}
                                    onKeep={() => onKeep(item)}
                                    onDelete={() => onDelete(item)}
                                />
                            );

                        case "comments":
                            return (
                                <ModerationCommentCard
                                    key={itemKey}
                                    item={item}
                                    selected={selected}
                                    busy={busy}
                                    onToggleSelected={() => onToggleSelected(item)}
                                    onOpen={() => onOpen(item.type, item.id)}
                                    onKeep={() => onKeep(item)}
                                    onDelete={() => onDelete(item)}
                                />
                            );

                        case "users":
                            return (
                                <ModerationUserCard
                                    key={itemKey}
                                    item={item}
                                    selected={selected}
                                    busy={busy}
                                    onToggleSelected={() => onToggleSelected(item)}
                                    onOpen={() => onOpen(item.type, item.id)}
                                    onKeep={() => onKeep(item)}
                                    onBlock={() => onBlock(item)}
                                    onUnblock={() => onUnblock(item)}
                                />
                            );

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