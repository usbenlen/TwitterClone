import { useNavigate } from "react-router";

import Moderation from "@/admin/components/moderation/Moderation";

import {
    useModeration,
    useModerationFilters,
    useModerationPagination,
    useModerationSelection,
} from "@/admin/hooks/moderation";

import type { ReportSignal } from "@/admin/types/moderation";

export default function AdminModerationPage() {
    const navigate = useNavigate();

    const params = new URLSearchParams(
        window.location.search,
    );

    const pageParam = Number(
        params.get("page"),
    );

    const currentPageFromUrl =
        Number.isFinite(pageParam) &&
        pageParam > 0
            ? pageParam
            : 1;

    const {
        filters,
        setSearch,
        setType,
        setStatus,
        setDecision,
        setSort,
        setSource,
    } = useModerationFilters();

    const {
        items,
        pagination,
        // isLoading,
        error,
        busyAction,
        blockItem,
        keepItem,
        deleteItem,
    } = useModeration(
        currentPageFromUrl,
        filters,
    );

    const {
        currentPage,
        totalPages,
        goToPage,
        resetPage,
    } = useModerationPagination(
        pagination.totalPages,
    );

    const getModerationKey = (
        item: ReportSignal,
    ) => item.id;

    const {
        selectedIds,
        allCurrentPageSelected,
        toggleSelected,
        toggleSelectAll,
        clearSelection,
    } = useModerationSelection(
        items,
        getModerationKey,
    );

    const handleTypeChange = (
        value: typeof filters.type,
    ) => {
        setType(value);
        resetPage();
    };

    const handleSearchChange = (
        value: string,
    ) => {
        setSearch(value);
        resetPage();
    };

    const handleStatusChange = (
        value: typeof filters.status,
    ) => {
        setStatus(value);
        resetPage();
    };

    const handleDecisionChange = (
        value: typeof filters.decision,
    ) => {
        setDecision(value);
        resetPage();
    };

    const handleSortChange = (
        value: typeof filters.sort,
    ) => {
        setSort(value);
        resetPage();
    };

    const handleSourceChange = (
        value: typeof filters.source,
    ) => {
        setSource(value);
        resetPage();
    };

    const handleOpen = (
        item: ReportSignal,
    ) => {
        navigate(
            `/admin/moderation/${item.id}`,
        );
    };

    const handleKeep = async (
        item: ReportSignal,
    ) => {
        await keepItem(item);
    };

    const handleBlock = async (
        item: ReportSignal,
    ) => {
        await blockItem(item);
    };

    const handleDelete = async (
        item: ReportSignal,
    ) => {
        await deleteItem(item);
    };

    const handleBlockSelected = async () => {
        const selectedItems =
            items.filter((item) =>
                selectedIds.includes(
                    getModerationKey(item),
                ),
            );

        for (const item of selectedItems) {
            await blockItem(item);
        }

        clearSelection();
    };

    // if (isLoading) {
    //     return <Spinner />;
    // }

    return (
        <Moderation
            items={items}
            filters={filters}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={pagination.total}
            selectedIds={selectedIds}
            allCurrentPageSelected={allCurrentPageSelected}
            busyAction={busyAction}
            error={error}
            onTypeChange={handleTypeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onDecisionChange={handleDecisionChange}
            onSortChange={handleSortChange}
            onSourceChange={handleSourceChange}
            onToggleSelected={toggleSelected}
            onToggleSelectAll={toggleSelectAll}
            onClearSelection={clearSelection}
            onBlockSelected={handleBlockSelected}
            onOpen={handleOpen}
            onKeep={handleKeep}
            onDelete={handleDelete}
            onBlock={handleBlock}
            onPageChange={goToPage}
        />
    );
}
