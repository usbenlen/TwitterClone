export type AnalyticsPeriod =
    | "7d"
    | "30d";

export type AnalyticsContentType =
    | "all"
    | "posts"
    | "comments";

export type DashboardAnalytics = {
    audience: Record<
        AnalyticsPeriod,
        number[]
    >;

    activity: Record<
        AnalyticsPeriod,
        {
            posts: number[];
            comments: number[];
        }
    >;
};