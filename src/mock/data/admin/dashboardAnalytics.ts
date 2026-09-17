import type { DashboardAnalyticsResponse } from "@/admin/types/analytics";

export const dashboardAnalyticsMock: DashboardAnalyticsResponse = {
    audience: {
        "7d": [
            42,
            45,
            48,
            52,
            55,
            58,
            60,
        ],

        "30d": [
            15,
            20,
            22,
            28,
            35,
            42,
            45,
            52,
            55,
            60,
        ],
    },

    activity: {
        "7d": {
            posts: [
                12,
                20,
                18,
                25,
                22,
                15,
                24,
            ],

            comments: [
                8,
                12,
                10,
                15,
                13,
                7,
                14,
            ],
        },

        "30d": {
            posts: [
                10,
                18,
                14,
                8,
                15,
                12,
                20,
                22,
                13,
                25,
            ],

            comments: [
                5,
                12,
                6,
                4,
                7,
                6,
                8,
                10,
                7,
                13,
            ],
        },
    },
};