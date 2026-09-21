import type {ModerationFiltersState} from "@/admin/types/moderation";

export const MODERATION_ITEMS_PER_PAGE = 10;

export const initialModerationFilters: ModerationFiltersState = {
    type: "all",
    search: "",
    status: "all",
    sort: "newest",
    source: "all",
} as const;