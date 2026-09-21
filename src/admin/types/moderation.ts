import type { Comment, Tweet, User } from "@/types";

export type ModerationTab =
    | "all"
    | "system"
    | "users"
    | "critical";

export type SignalType =
    | "system"
    | "users"
    | "synergy";

export type Priority =
    | "critical"
    | "high"
    | "medium"
    | "low";

export type ModerationType =
    | "all"
    | "users"
    | "posts"
    | "comments";

export type ModerationStatus =
    | "approved"
    | "pending"
    | "deleted"
    | "blocked";

export const statusLabels: Record<
    ModerationStatus,
    string
> = {
    approved: "Схвалено",
    pending: "На перевірці",
    deleted: "Видалено",
    blocked: "Заблоковано",
};

export type ModerationStatusFilter =
    | "all"
    | "approved"
    | "pending"
    | "blocked"
    | "deleted";

export type ModerationSort =
    | "newest"
    | "oldest"
    | "reports"
    | "activity";

export type ModerationSource =
    | "all"
    | "system"
    | "reports";

export type ModerationMeta = {
    signalType: SignalType;
    signalLabel: string;
    signalDescription: string;
    priority: Priority;
    priorityLabel: string;
};

export type ModerationReportReason =
    | "spam"
    | "harassment"
    | "hate"
    | "hate_speech"
    | "violence"
    | "sexual"
    | "misinformation"
    | "other";

export type ModerationSignalSource =
    | "user"
    | "system";

export type ModerationSignal = {
    id: string;

    source: ModerationSignalSource;

    targetId: string;

    targetType:
        | "posts"
        | "users"
        | "comments";

    status?: ModerationStatus;

    reason: ModerationReportReason;
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

type ModerationItemBase<
    TType extends "posts" | "users" | "comments",
    TSubject,
> = {
    type: TType;
    id: string;

    subject: TSubject;

    signals: ModerationSignal[];

    status: ModerationStatus;

    meta: ModerationMeta;
};

export type ModerationItem =
    | ModerationItemBase<"posts", Tweet>
    | ModerationItemBase<"users", User>
    | ModerationItemBase<"comments", Comment>;

export type ModerationFiltersState = {
    type: ModerationType;
    search: string;
    status: ModerationStatusFilter;
    sort: ModerationSort;
    source: ModerationSource;
};

export interface ModerationCardProps<
    T extends ModerationItem = ModerationItem,
> {
    item: T;
    selected: boolean;
    busy: boolean;

    onToggleSelected: () => void;
    onOpen: () => void;

    onApprove: () => void;
    onReject: () => void;
    onBlock: () => void;

    onToggleDelete?: () => void;
}

export type ModerationAction =
    | "delete"
    | "block";

export const getModerationAction = (
    type: "posts" | "comments" | "users",
): ModerationAction => {
    return type === "users"
        ? "block"
        : "delete";
};

export type ModerationReportType =
    | "post"
    | "comment"
    | "user";

export type ModerationReportStatus =
    | "pending"
    | "approved"
    | "blocked"
    | "deleted";

export type ModerationReportSource =
    | "user"
    | "system";

export type ModerationReport = {
    id: string;

    type: ModerationReportType;

    reason: string;
    description?: string;

    status: ModerationReportStatus;

    source: ModerationReportSource;

    reporter?: {
        id: string;
        username: string;
        displayName?: string;
        avatarUrl?: string;
    };

    targetId: string;

    target?: {
        id: string;
        content?: string;

        author?: {
            id: string;
            username: string;
            displayName?: string;
            avatarUrl?: string;
        };
    };

    createdAt: string;
};