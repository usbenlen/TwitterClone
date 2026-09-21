import type {ModerationStatus} from "@/admin/types/moderation.ts";

export type ReportTarget =
| {
    type: "posts";
    id: string;
}
| {
    type: "comments";
    id: string;
}
| {
    type: "users";
    id: string;
};

export type AdminReport = {
    id: string;
    reason: string;
    description?: string;
    status: "pending" | "resolved" | "rejected";
    createdAt: string;

    reporter: {
        id: string;
        username: string;
        displayName: string;
        avatarUrl?: string;
    };

    target: ReportTarget;
};

export type ReportTargetProps = {
    target: ReportTarget;
    status?: ModerationStatus;
};