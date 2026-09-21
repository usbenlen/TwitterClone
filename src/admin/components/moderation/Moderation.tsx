import ModerationHero from "./ModerationHero";
import ModerationFilters from "./ModerationFilters";
import ModerationList from "./ModerationList";
import ModerationPagination from "./ModerationPagination";

import type {
    ModerationFiltersState,
    ModerationItem,
} from "@/admin/types/moderation";

type ModerationProps = {
    items: ModerationItem[];
    filters: ModerationFiltersState;

    currentPage: number;
    totalPages: number;
    totalCount: number;

    selectedIds: string[];
    allCurrentPageSelected: boolean;

    busyAction: string | null;
    error: string | null;

    onTypeChange: (
        value: ModerationFiltersState["type"],
    ) => void;

    onSearchChange: (value: string) => void;

    onStatusChange: (
        value: ModerationFiltersState["status"],
    ) => void;

    onSortChange: (
        value: ModerationFiltersState["sort"],
    ) => void;

    onSourceChange: (
        value: ModerationFiltersState["source"],
    ) => void;

    onToggleSelected: (item: ModerationItem) => void;
    onToggleSelectAll: () => void;
    onClearSelection: () => void;

    onOpen: (item: ModerationItem) => void;

    onKeep: (item: ModerationItem) => void;
    onDelete: (item: ModerationItem) => void;

    onPageChange: (page: number) => void;

    onBlockSelected: () => void;

    onBlock: (item: ModerationItem) => void;
    onUnblock: (item: ModerationItem) => void;
};

export default function Moderation({
   items,
   filters,
   currentPage,
   totalPages,
   totalCount,
   selectedIds,
   allCurrentPageSelected,
   busyAction,
   onTypeChange,
   onSearchChange,
   onStatusChange,
   onSortChange,
   onSourceChange,
   onToggleSelected,
   onToggleSelectAll,
   onBlockSelected,
   onOpen,
   onKeep,
   onDelete,
   onBlock,
   onUnblock,
   onPageChange,
   onClearSelection,
}: ModerationProps) {
    return (
        <div className="w-full bg-card rounded-xl border border-border">
            <div className="p-4">
            <ModerationHero count={totalCount} />

            <ModerationFilters
                type={filters.type}
                search={filters.search}
                moderationStatus={filters.status}
                sort={filters.sort}
                source={filters.source}
                onTypeChange={onTypeChange}
                onSearchChange={onSearchChange}
                onStatusChange={onStatusChange}
                onSortChange={onSortChange}
                onSourceChange={onSourceChange}
            />
            </div>

            <ModerationList
                items={items}
                selectedIds={selectedIds}
                busyAction={busyAction}
                allCurrentPageSelected={allCurrentPageSelected}
                onToggleSelected={onToggleSelected}
                onToggleSelectAll={onToggleSelectAll}
                onClearSelection={onClearSelection}
                onBlockSelected={onBlockSelected}
                onOpen={onOpen}
                onKeep={onKeep}
                onDelete={onDelete}
                onBlock={onBlock}
                onUnblock={onUnblock}
            />

            <ModerationPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </div>
    );
}