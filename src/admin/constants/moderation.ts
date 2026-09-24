import type { ReportFiltersState } from "@/admin/types/moderation";

export const MODERATION_ITEMS_PER_PAGE = 10;

export const initialModerationFilters: ReportFiltersState = {
    type: "all",
    search: "",
    source: "all",
    status: "all",
    decision: "all",
    sort: "newest",
} as const;