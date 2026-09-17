import type { ModerationStatus } from "@/admin/components/moderation/types";

export const moderationStatuses: Record<
    string,
    ModerationStatus
> = {
    "posts:t2": "pending",
    "posts:t3": "pending",
    "posts:t4": "pending",

    "users:u1": "pending",

    "comments:c1": "pending",
    "comments:c3": "pending",
    "comments:c6": "pending",
};