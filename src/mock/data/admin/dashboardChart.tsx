import type {
    DashboardChartData,
    DashboardPeriod,
} from "@/admin/types/dashboard";

export const mockDashboardChartData: Record<
    DashboardPeriod,
    DashboardChartData
> = {
    "7d": {
        audience: [
            120,
            145,
            132,
            178,
            165,
            190,
            210,
        ],

        activity: {
            all: [
                45,
                52,
                48,
                67,
                61,
                72,
                80,
            ],

            posts: [
                25,
                30,
                28,
                39,
                35,
                42,
                47,
            ],

            comments: [
                20,
                22,
                20,
                28,
                26,
                30,
                33,
            ],
        },
    },

    "30d": {
        audience: [
            120,
            145,
            132,
            178,
            165,
            190,
            210,
            225,
            240,
            230,
        ],

        activity: {
            all: [
                45,
                52,
                48,
                67,
                61,
                72,
                80,
                86,
                91,
                95,
            ],

            posts: [
                25,
                30,
                28,
                39,
                35,
                42,
                47,
                50,
                54,
                58,
            ],

            comments: [
                20,
                22,
                20,
                28,
                26,
                30,
                33,
                36,
                37,
                37,
            ],
        },
    },

    all: {
        audience: [
            120,
            145,
            132,
            178,
            165,
            190,
            210,
            225,
            240,
            260,
        ],

        activity: {
            all: [
                45,
                52,
                48,
                67,
                61,
                72,
                80,
                86,
                91,
                105,
            ],

            posts: [
                25,
                30,
                28,
                39,
                35,
                42,
                47,
                50,
                54,
                60,
            ],

            comments: [
                20,
                22,
                20,
                28,
                26,
                30,
                33,
                36,
                37,
                45,
            ],
        },
    },
};