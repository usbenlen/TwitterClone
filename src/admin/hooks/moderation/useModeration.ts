import { useEffect, useState } from "react";

import { moderationApi } from "@/admin/api/moderation.api.ts";

import type {
    ReportDecision,
    ReportSignal,
    ReportTargetType,
} from "@/admin/types/moderation";

export default function useModeration() {
    const [items, setItems] = useState<ReportSignal[]>(
        [],
    );

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] = useState<
        string | null
    >(null);

    const [busyAction, setBusyAction] = useState<
        string | null
    >(null);

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

    const updateReport = async (
        item: ReportSignal,
        decision: ReportDecision,
    ) => {
        try {
            setBusyAction(
                `item:${item.targetType}:${item.targetId}`,
            );

            setError(null);

            await moderationApi.updateStatus(
                item.targetType,
                item.targetId,
                "resolved",
                decision,
            );

            setItems((previousItems) =>
                previousItems.map(
                    (currentItem) =>
                        currentItem.id === item.id
                            ? {
                                ...currentItem,
                                reportStatus:
                                    "resolved",
                                decision,
                            }
                            : currentItem,
                ),
            );
        } catch {
            setError(
                "Не вдалося змінити статус скарги.",
            );
        } finally {
            setBusyAction(null);
        }
    };

    const approveItem = async (
        type: ReportTargetType,
        itemId: string,
    ) => {
        const item = items.find(
            (currentItem) =>
                currentItem.targetType === type &&
                currentItem.targetId === itemId,
        );

        if (!item) {
            return;
        }

        await updateReport(item, "kept");
    };

    const keepItem = async (
        item: ReportSignal,
    ) => {
        await updateReport(item, "kept");
    };

    const deleteItem = async (
        item: ReportSignal,
    ) => {
        await updateReport(item, "deleted");
    };

    const rejectItem = async (
        type: ReportTargetType,
        itemId: string,
    ) => {
        const item = items.find(
            (currentItem) =>
                currentItem.targetType === type &&
                currentItem.targetId === itemId,
        );

        if (!item) {
            return;
        }

        await updateReport(item, "deleted");
    };

    const blockItem = async (
        item: ReportSignal,
    ) => {
        await updateReport(item, "blocked");
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
    };
}