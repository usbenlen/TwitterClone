import { useEffect, useState } from "react";

import { moderationApi } from "@/admin/api/moderationApi.ts";

import { MOCK_ENABLED } from "@/mock/config";
import { moderationSignals } from "@/mock/data/admin/moderationSignals";

import type {
    ModerationItem,
    ModerationStatus,
    ModerationType,
} from "@/admin/types/moderation";

export function useModeration() {
    const [items, setItems] = useState<
        ModerationItem[]
    >([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] = useState<
        string | null
    >(null);

    const [busyAction, setBusyAction] =
        useState<string | null>(null);

    const updateSignalStatus = (
        type: Exclude<ModerationType, "all">,
        itemId: string,
        status: ModerationStatus,
    ) => {
        if (!MOCK_ENABLED) {
            return;
        }

        moderationSignals.forEach((signal) => {
            if (
                signal.targetType === type &&
                signal.targetId === itemId
            ) {
                signal.status = status;
            }
        });
    };

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setIsLoading(true);
                setError(null);

                const response =
                    await moderationApi.getItems();

                if (cancelled) {
                    return;
                }

                setItems(response);
            } catch {
                if (!cancelled) {
                    setError(
                        "Не вдалося завантажити чергу модерації.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    const updateStatus = async (
        type: Exclude<ModerationType, "all">,
        itemId: string,
        status: ModerationStatus,
    ) => {
        const item = items.find(
            (currentItem) =>
                currentItem.type === type &&
                currentItem.id === itemId,
        );

        if (!item) {
            return;
        }

        try {
            setBusyAction(
                `item:${type}:${itemId}`,
            );
            setError(null);

            await moderationApi.updateStatus(
                type,
                itemId,
                status,
            );

            updateSignalStatus(
                type,
                itemId,
                status,
            );

            setItems((previousItems) =>
                previousItems.map((currentItem) =>
                    currentItem.type === type &&
                    currentItem.id === itemId
                        ? {
                            ...currentItem,
                            status,
                        }
                        : currentItem,
                ),
            );
        } catch {
            setError(
                "Не вдалося змінити статус модерації.",
            );
        } finally {
            setBusyAction(null);
        }
    };

    const approveItem = async (
        type: Exclude<
            ModerationType,
            "all"
        >,
        itemId: string,
    ) => {
        await updateStatus(
            type,
            itemId,
            "approved",
        );
    };

    const deleteItem = async (
        item: ModerationItem,
    ) => {
        try {
            setBusyAction(
                `item:${item.type}:${item.id}`,
            );
            setError(null);

            await moderationApi.updateStatus(
                item.type,
                item.id,
                "deleted",
            );

            updateSignalStatus(
                item.type,
                item.id,
                "deleted",
            );

            setItems((prev) =>
                prev.map((currentItem) => {
                    if (
                        currentItem.type !== item.type ||
                        currentItem.id !== item.id
                    ) {
                        return currentItem;
                    }

                    return {
                        ...currentItem,
                        status: "deleted",
                    };
                }),
            );
        } catch {
            setError(
                "Не вдалося видалити елемент.",
            );
        } finally {
            setBusyAction(null);
        }
    };

    const removeFromQueue = (
        type: ModerationType,
        itemId: string,
    ) => {
        setItems((prev) =>
            prev.filter(
                (item) =>
                    !(
                        item.type === type &&
                        item.id === itemId
                    ),
            ),
        );
    };

    const keepItem = async (
        item: ModerationItem,
    ) => {
        try {
            setBusyAction(
                `item:${item.type}:${item.id}`,
            );
            setError(null);

            await moderationApi.updateStatus(
                item.type,
                item.id,
                "approved",
            );

            updateSignalStatus(
                item.type,
                item.id,
                "approved",
            );

            setItems((prev) =>
                prev.map((currentItem) => {
                    if (
                        currentItem.type !== item.type ||
                        currentItem.id !== item.id
                    ) {
                        return currentItem;
                    }

                    return {
                        ...currentItem,
                        status: "approved",
                    };
                }),
            );
        } catch {
            setError(
                "Не вдалося залишити елемент.",
            );
        } finally {
            setBusyAction(null);
        }
    };

    const rejectItem = async (
        type: Exclude<
            ModerationType,
            "all"
        >,
        itemId: string,
    ) => {
        try {
            setBusyAction(
                `item:${type}:${itemId}`,
            );
            setError(null);

            await updateStatus(
                type,
                itemId,
                "deleted",
            );

            removeFromQueue(
                type,
                itemId,
            );
        } catch {
            setError(
                "Не вдалося видалити елемент.",
            );
        } finally {
            setBusyAction(null);
        }
    };

    const blockItem = async (
        item: ModerationItem,
    ) => {
        try {
            setBusyAction(
                `item:${item.type}:${item.id}`,
            );
            setError(null);

            await moderationApi.updateStatus(
                item.type,
                item.id,
                "blocked",
            );

            updateSignalStatus(
                item.type,
                item.id,
                "blocked",
            );

            setItems((prev) =>
                prev.map((currentItem) => {
                    if (
                        currentItem.type !== item.type ||
                        currentItem.id !== item.id
                    ) {
                        return currentItem;
                    }

                    return {
                        ...currentItem,
                        status: "blocked",
                    };
                }),
            );
        } catch {
            setError(
                "Не вдалося заблокувати елемент.",
            );
        } finally {
            setBusyAction(null);
        }
    };

    const unblockItem = async (
        item: ModerationItem,
    ) => {
        try {
            setBusyAction(
                `item:${item.type}:${item.id}`,
            );
            setError(null);

            await moderationApi.updateStatus(
                item.type,
                item.id,
                "approved",
            );

            updateSignalStatus(
                item.type,
                item.id,
                "approved",
            );

            setItems((prev) =>
                prev.map((currentItem) => {
                    if (
                        currentItem.type !== item.type ||
                        currentItem.id !== item.id
                    ) {
                        return currentItem;
                    }

                    return {
                        ...currentItem,
                        status: "approved",
                    };
                }),
            );
        } catch {
            setError(
                "Не вдалося розблокувати елемент.",
            );
        } finally {
            setBusyAction(null);
        }
    };

    return {
        items,
        isLoading,
        error,
        busyAction,
        approveItem,
        rejectItem,
        blockItem,
        keepItem,
        deleteItem,
        unblockItem,
    };
}