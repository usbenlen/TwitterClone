import type { ModerationReport } from "@/admin/components/moderation/types";

export const moderationUserReports: ModerationReport[] = [
    {
        id: "user-report-1",
        userId: "u2",
        reason: "spam",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 10,
        ).toISOString(),
    },

    {
        id: "user-report-2",
        userId: "u2",
        reason: "spam",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 15,
        ).toISOString(),
    },

    {
        id: "user-report-3",
        userId: "u2",
        reason: "harassment",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 22,
        ).toISOString(),
    },

    {
        id: "user-report-5",
        userId: "u3",
        reason: "hate",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 42,
        ).toISOString(),
    },

    {
        id: "user-report-6",
        userId: "u4",
        reason: "spam",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 55,
        ).toISOString(),
    },
];