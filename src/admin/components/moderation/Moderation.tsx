import ModerationHeader from "./ModerationHeader.tsx";
import ModerationFilters from "./ModerationFilters";
import ModerationList from "./ModerationList";
import ModerationPagination from "./ModerationPagination";

import type {
    ReportSignal,
    ReportFiltersState,
} from "@/admin/types/moderation";

type ModerationProps = {
    items: ReportSignal[];
    filters: ReportFiltersState;

    currentPage: number;
    totalPages: number;
    totalCount: number;

    selectedIds: string[];
    allCurrentPageSelected: boolean;

    busyAction: string | null;
    error: string | null;

    onTypeChange: (value: ReportFiltersState["type"]) => void;

    onSearchChange: (value: string) => void;
    onStatusChange: (value: ReportFiltersState["status"]) => void;
    onDecisionChange: (value: ReportFiltersState["decision"]) => void;
    onSortChange: (value: ReportFiltersState["sort"]) => void;
    onSourceChange: (value: ReportFiltersState["source"]) => void;

    onToggleSelected: (item: ReportSignal) => void;
    onToggleSelectAll: () => void;
    onClearSelection: () => void;

    onOpen: (item: ReportSignal) => void;
    onKeep: (item: ReportSignal) => void;
    onDelete: (item: ReportSignal) => void;

    onPageChange: (page: number) => void;

    onBlockSelected: () => void;
    onBlock: (item: ReportSignal) => void;
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
   onDecisionChange,
   onSortChange,
   onSourceChange,
   onToggleSelected,
   onToggleSelectAll,
   onBlockSelected,
   onOpen,
   onKeep,
   onDelete,
   onBlock,
   onPageChange,
   onClearSelection,
}: ModerationProps) {
    return (
        <div className="w-full rounded-xl border border-border bg-card">
            <div className="p-4">
                <ModerationHeader count={totalCount}/>

                <ModerationFilters
                    type={filters.type}
                    search={filters.search}
                    moderationStatus={filters.status}
                    decision={filters.decision}
                    sort={filters.sort}
                    source={filters.source}
                    onTypeChange={onTypeChange}
                    onSearchChange={onSearchChange}
                    onStatusChange={onStatusChange}
                    onDecisionChange={onDecisionChange}
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
            />

            <ModerationPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </div>
    );
}