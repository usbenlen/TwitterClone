import { useNavigate } from "react-router";

import Moderation from "@/admin/components/moderation/Moderation";
import { useModeration } from "@/admin/hooks/moderation/useModeration.ts";
import { useModerationFilters } from "@/admin/hooks/moderation/useModerationFilters.ts";
import { useModerationPagination } from "@/admin/hooks/moderation/useModerationPagination.ts";
import { useModerationSelection } from "@/admin/hooks/moderation/useModerationSelection.ts";
import { Spinner } from "@/ui";

import type { ModerationItem } from "@/admin/components/moderation/types";

export default function AdminModerationPage() {
    const navigate = useNavigate();

    const {
        items,
        isLoading,
        error,
        busyAction,
        blockItem,
        unblockItem,
        keepItem,
        deleteItem,
    } = useModeration();

    const {
        filters,
        filteredItems,
        setSearch,
        setType,
        setStatus,
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
        item: ModerationItem,
    ) => `${item.type}:${item.id}`;

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
        type: ModerationItem["type"],
        itemId: string,
    ) => {
        switch (type) {
            case "posts":
                navigate(`/admin/post/${itemId}`);
                break;

            case "comments":
                navigate(`/admin/comment/${itemId}`);
                break;

            case "users":
                navigate(`/admin/user/${itemId}`);
                break;
        }
    };

    const handleKeep = async (
        item: ModerationItem,
    ) => {
        await keepItem(item);
    };

    const handleBlock = async (
        item: ModerationItem,
    ) => {
        await blockItem(item);
    };

    const handleUnblock = async (
        item: ModerationItem,
    ) => {
        await unblockItem(item);
    };

    const handleDelete = async (
        item: ModerationItem,
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
            <div className="mx-auto flex w-full max-w-[1366px] justify-center py-16">
                <Spinner />
            </div>
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
            allCurrentPageSelected={
                allCurrentPageSelected
            }
            busyAction={busyAction}
            error={error}
            onTypeChange={handleTypeChange}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onSortChange={handleSortChange}
            onSourceChange={handleSourceChange}
            onToggleSelected={toggleSelected}
            onToggleSelectAll={
                toggleSelectAll
            }
            onClearSelection={clearSelection}
            onBlockSelected={
                handleBlockSelected
            }
            onOpen={handleOpen}
            onKeep={handleKeep}
            onDelete={handleDelete}
            onBlock={handleBlock}
            onUnblock={handleUnblock}
            onPageChange={goToPage}
        />
    );
}

