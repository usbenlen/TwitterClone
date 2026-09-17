import type { AnalyticsPeriod } from "@/admin/types/analytics";

export const AUDIENCE_SCALE = 200;

export const periodLabels: Record<
    AnalyticsPeriod,
    string
> = {
    "7d": "7 днів",
    "30d": "30 днів",
};