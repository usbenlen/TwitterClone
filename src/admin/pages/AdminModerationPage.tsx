import { useNavigate } from "react-router";

import Moderation from "@/admin/components/moderation/Moderation";

import {
    useModeration,
    useModerationFilters,
    useModerationPagination,
    useModerationSelection
} from "@/admin/hooks/moderation";

import { Spinner } from "@/ui";

import type { ReportSignal } from "@/admin/types/moderation";

export default function AdminModerationPage() {
    const navigate = useNavigate();

    const {
        items,
        isLoading,
        error,
        busyAction,
        blockItem,
        keepItem,
        deleteItem,
    } = useModeration();

    const {
        filters,
        filteredItems,
        setSearch,
        setType,
        setStatus,
        setDecision,
        setSort,
        setSource,
    } = useModerationFilters(items);

    const {
        currentPage,
        totalPages,
        paginatedItems,
        goToPage,
        resetPage,
    } = useModerationPagination(
        filteredItems,
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
        paginatedItems,
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
            paginatedItems.filter((item) =>
                selectedIds.includes(
                    getModerationKey(item),
                ),
            );

        for (const item of selectedItems) {
            await blockItem(item);
        }

        clearSelection();
    };

    if (isLoading) {
        return (
            <Spinner/>
        );
    }

    return (
        <Moderation
            items={paginatedItems}
            filters={filters}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={filteredItems.length}
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