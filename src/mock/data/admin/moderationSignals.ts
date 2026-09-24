import type { ReportSignal } from "@/admin/types/moderation";

export const moderationSignals: ReportSignal[] = [
    {
        id: "post-signal-1",
        targetType: "posts",
        targetId: "t2",

        source: "user",
        reason: "spam",
        reasonLabel: "Спам",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 15,
        ).toISOString(),

        reporter: {
            id: "u3",
            username: "linus",
        },
    },

    {
        id: "post-signal-2",
        targetType: "posts",
        targetId: "t2",

        source: "user",
        reason: "harassment",
        reasonLabel: "Образливий контент",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 12,
        ).toISOString(),

        reporter: {
            id: "u1",
            username: "dev_user",
        },
    },

    {
        id: "post-signal-3",
        targetType: "posts",
        targetId: "t2",

        source: "user",
        reason: "spam",
        reasonLabel: "Спам",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 8,
        ).toISOString(),

        reporter: {
            id: "u2",
            username: "ada",
        },
    },

    {
        id: "post-signal-4",
        targetType: "posts",
        targetId: "t2",

        source: "system",
        reason: "spam",
        reasonLabel: "Спам",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 5,
        ).toISOString(),

        system: {
            code: "SPAM_DETECTOR",
            label: "Автоматичне виявлення спаму",
        },
    },

    {
        id: "post-signal-5",
        targetType: "posts",
        targetId: "t3",

        source: "user",
        reason: "harassment",
        reasonLabel: "Образливий контент",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 10,
        ).toISOString(),

        reporter: {
            id: "u2",
            username: "ada",
        },
    },

    {
        id: "post-signal-6",
        targetType: "posts",
        targetId: "t4",

        source: "user",
        reason: "spam",
        reasonLabel: "Спам",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 16,
        ).toISOString(),

        reporter: {
            id: "u3",
            username: "linus",
        },
    },

    {
        id: "post-signal-7",
        targetType: "posts",
        targetId: "t4",

        source: "user",
        reason: "misinformation",
        reasonLabel: "Дезінформація",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 14,
        ).toISOString(),

        reporter: {
            id: "u2",
            username: "ada",
        },
    },

    {
        id: "post-signal-8",
        targetType: "posts",
        targetId: "t5",

        source: "user",
        reason: "misinformation",
        reasonLabel: "Дезінформація",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 14,
        ).toISOString(),

        reporter: {
            id: "u3",
            username: "ada",
        },
    },

    {
        id: "post-signal-9",
        targetType: "posts",
        targetId: "t5",

        source: "user",
        reason: "spam",
        reasonLabel: "Спам",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 25,
        ).toISOString(),

        reporter: {
            id: "u4",
            username: "john",
        },
    },

    {
        id: "post-signal-10",
        targetType: "posts",
        targetId: "t7",

        source: "user",
        reason: "harassment",
        reasonLabel: "Переслідування",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 40,
        ).toISOString(),

        reporter: {
            id: "u5",
            username: "maria",
        },
    },

    {
        id: "post-signal-11",
        targetType: "posts",
        targetId: "t7",

        source: "user",
        reason: "hate_speech",
        reasonLabel: "Мова ворожнечі",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 55,
        ).toISOString(),

        reporter: {
            id: "u2",
            username: "alex",
        },
    },

    {
        id: "post-signal-12",
        targetType: "posts",
        targetId: "t8",

        source: "user",
        reason: "violence",
        reasonLabel: "Насильство",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 70,
        ).toISOString(),

        reporter: {
            id: "u6",
            username: "sarah",
        },
    },

    {
        id: "post-signal-13",
        targetType: "posts",
        targetId: "t9",

        source: "user",
        reason: "misinformation",
        reasonLabel: "Дезінформація",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 90,
        ).toISOString(),

        reporter: {
            id: "u7",
            username: "mike",
        },
    },

    {
        id: "post-signal-14",
        targetType: "posts",
        targetId: "t9",

        source: "user",
        reason: "spam",
        reasonLabel: "Спам",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 110,
        ).toISOString(),

        reporter: {
            id: "u8",
            username: "olivia",
        },
    },

    {
        id: "user-signal-1",
        targetType: "users",
        targetId: "u3",

        source: "user",
        reason: "spam",
        reasonLabel: "Спам",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 20,
        ).toISOString(),

        reporter: {
            id: "u2",
            username: "ada",
        },
    },

    {
        id: "user-signal-2",
        targetType: "users",
        targetId: "u3",

        source: "user",
        reason: "harassment",
        reasonLabel: "Образливий контент",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 20,
        ).toISOString(),

        reporter: {
            id: "u1",
            username: "dev_user",
        },
    },

    {
        id: "user-signal-3",
        targetType: "users",
        targetId: "u4",

        source: "user",
        reason: "spam",
        reasonLabel: "Спам",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 25,
        ).toISOString(),

        reporter: {
            id: "u3",
            username: "linus",
        },
    },

    {
        id: "user-signal-4",
        targetType: "users",
        targetId: "u5",

        source: "user",
        reason: "harassment",
        reasonLabel: "Образливий контент",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 30,
        ).toISOString(),

        reporter: {
            id: "u2",
            username: "ada",
        },
    },

    {
        id: "user-signal-5",
        targetType: "users",
        targetId: "u6",

        source: "system",
        reason: "spam",
        reasonLabel: "Спам",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 18,
        ).toISOString(),

        system: {
            code: "ACCOUNT_SPAM_DETECTOR",
            label: "Підозріла активність акаунта",
        },
    },

    {
        id: "comment-signal-1",
        targetType: "comments",
        targetId: "c1",

        source: "user",
        reason: "harassment",
        reasonLabel: "Образливий контент",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 11,
        ).toISOString(),

        reporter: {
            id: "u3",
            username: "linus",
        },
    },

    {
        id: "comment-signal-2",
        targetType: "comments",
        targetId: "c1",

        source: "user",
        reason: "spam",
        reasonLabel: "Спам",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 9,
        ).toISOString(),

        reporter: {
            id: "u2",
            username: "ada",
        },
    },

    {
        id: "comment-signal-3",
        targetType: "comments",
        targetId: "c3",

        source: "system",
        reason: "spam",
        reasonLabel: "Спам",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 6,
        ).toISOString(),

        system: {
            code: "COMMENT_SPAM_DETECTOR",
            label: "Автоматичне виявлення спаму",
        },
    },

    {
        id: "comment-signal-4",
        targetType: "comments",
        targetId: "c6",

        source: "user",
        reason: "misinformation",
        reasonLabel: "Дезінформація",
        status: "pending",
        createdAt: new Date(
            Date.now() - 1000 * 60 * 4,
        ).toISOString(),

        reporter: {
            id: "u2",
            username: "ada",
        },
    },
];