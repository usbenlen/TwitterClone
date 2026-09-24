import type {ReportSort} from "@/admin/hooks/moderation/useModerationFilters.ts";

export type ReportSignalSource =
    | "user"
    | "system";

import type {
    Comment,
    Tweet,
    User,
} from "@/types";

export type ReportTarget =
    | {
    type: "posts";
    id: string;
    data: Tweet;
}
    | {
    type: "comments";
    id: string;
    data: Comment;
}
    | {
    type: "users";
    id: string;
    data: User;
};

export type ReportTargetType =
    | "posts"
    | "users"
    | "comments";

export type ModerationType =
    | "all"
    | ReportTargetType;

export type ReportReason =
    | "spam"
    | "harassment"
    | "hate_speech"
    | "violence"
    | "sexual"
    | "misinformation"
    | "other";

export type ReportStatus =
    | "pending"
    | "resolved";

export type ReportDecision =
    | "kept"
    | "deleted"
    | "blocked";

export type ReportSignal = {
    id: string;
    source: ReportSignalSource;
    targetType: ReportTargetType;
    targetId: string;
    status: ReportStatus;
    decision?: ReportDecision;
    reason: ReportReason;
    reasonLabel: string;
    createdAt: string;

    reporter?: {
        id: string;
        username: string;
    };

    system?: {
        code: string;
        label: string;
    };
};

export const reportStatusLabels: Record<
    ReportStatus,
    string
> = {
    pending: "На перевірці",
    resolved: "Завершено",
};

export const decisionLabels: Record<
    ReportDecision,
    string
> = {
    kept: "Залишено",
    deleted: "Видалено",
    blocked: "Заблоковано",
};

export type ReportFiltersState = {
    type: ReportTargetType | "all";
    search: string;
    source: ReportSignalSource | "all";
    status: ReportStatus | "all";
    decision: ReportDecision | "all";
    sort: ReportSort;
};