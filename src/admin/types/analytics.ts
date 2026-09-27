export type AnalyticsPeriod =
    | "7d"
    | "30d";

export type AnalyticsContentType =
    | "all"
    | "posts"
    | "comments";

export type AnalyticsPoint = {
    date: string;
    value: number;
};

export type DashboardAnalytics = {
    audience: Record<
        AnalyticsPeriod,
        AnalyticsPoint[]
    >;

    activity: Record<
        AnalyticsPeriod,
        {
            posts: AnalyticsPoint[];
            comments: AnalyticsPoint[];
        }
    >;
};