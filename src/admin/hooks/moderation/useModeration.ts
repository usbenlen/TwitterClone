import { useEffect, useState } from "react";

import { moderationApi } from "@/admin/api/moderation.api.ts";

import type {
    ReportDecision,
    ReportSignal,
    ReportTargetType,
} from "@/admin/types/moderation";

import type {
    ReportFiltersState,
} from "./useModerationFilters";

const defaultFilters: ReportFiltersState = {
    search: "",
    type: "all",
    source: "all",
    status: "all",
    decision: "all",
    sort: "newest",
};

export default function useModeration(
    page = 1,
    filters: ReportFiltersState = defaultFilters,
) {
    const [items, setItems] = useState<ReportSignal[]>(
        [],
    );

    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 1,
    });

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
                    await moderationApi.getItems({
                        page,
                        search: filters.search,
                        type: filters.type,
                        source: filters.source,
                        status: filters.status,
                        decision: filters.decision,
                        sort: filters.sort,
                    });

                if (cancelled) {
                    return;
                }

                setItems(response.items);
                setPagination(response.pagination);
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
    }, [
        page,
        filters.search,
        filters.type,
        filters.source,
        filters.status,
        filters.decision,
        filters.sort,
    ]);

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
                item.id,
                "resolved",
                decision,
            );

            setItems((previousItems) =>
                previousItems.map(
                    (currentItem) =>
                        currentItem.id === item.id
                            ? {
                                ...currentItem,
                                status: "resolved",
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
        try {
            setBusyAction(
                `item:${item.targetType}:${item.targetId}`,
            );

            setError(null);

            if (item.targetType === "posts") {
                await moderationApi.deletePost(
                    item.targetId,
                );
            }

            if (item.targetType === "comments") {
                await moderationApi.deleteComment(
                    item.targetId,
                );
            }

            if (item.targetType === "users") {
                await moderationApi.deleteUser(
                    item.targetId,
                );
            }

            await moderationApi.updateStatus(
                item.id,
                "resolved",
                "deleted",
            );

            setItems((previousItems) =>
                previousItems.filter(
                    (currentItem) =>
                        currentItem.id !== item.id,
                ),
            );
        } catch {
            setError(
                "Не вдалося видалити об'єкт.",
            );
        } finally {
            setBusyAction(null);
        }
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
        pagination,
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