import { appApi, request } from "@/store/api";
import { adminApi } from "@/admin/api";
import { removeCachedTweet } from "@/store/postsApi";
import { sessionGeneration } from "@/store/session";

import type { AppDispatch, RootState } from "@/store";
import type {
  AnalyticsPeriod,
  ModerationParams,
  UserAction,
  UsersParams,
} from "@/admin/types";
import type { ReportDecision, ReportSignal } from "@/types/report";

const changedTags = [
  "AdminUser",
  "Report",
  "Dashboard",
  "Profile",
  "Post",
  "List",
  "Following",
  "Followers",
  "Recommendation",
  "History",
] as const;

export const adminQueries = appApi.injectEndpoints({
  endpoints: (build) => ({
    adminUsers: build.query({
      queryFn: (params: UsersParams) => request(() => adminApi.users(params)),
      providesTags: ["AdminUser"],
    }),
    adminUser: build.query({
      queryFn: (id: string) => request(() => adminApi.user(id)),
      providesTags: (_data, _error, id) => [{ type: "AdminUser", id }],
    }),
    adminReports: build.query({
      queryFn: (params: ModerationParams) =>
        request(() => adminApi.reports(params)),
      providesTags: ["Report"],
    }),
    adminReport: build.query({
      queryFn: (id: string) => request(() => adminApi.report(id)),
      providesTags: (_data, _error, id) => [{ type: "Report", id }],
    }),
    adminMetrics: build.query({
      queryFn: () => request(() => adminApi.metrics()),
      providesTags: [{ type: "Dashboard", id: "METRICS" }],
    }),
    adminAnalytics: build.query({
      queryFn: (period: AnalyticsPeriod) =>
        request(() => adminApi.analytics(period)),
      providesTags: [{ type: "Dashboard", id: "ANALYTICS" }],
    }),
    adminTables: build.query({
      queryFn: (limit: number) => request(() => adminApi.tables(limit)),
      providesTags: [{ type: "Dashboard", id: "TABLES" }],
    }),
    adminUserAction: build.mutation<void, { id: string; action: UserAction }>({
      queryFn: ({ id, action }) =>
        request(() => adminApi.actOnUser(id, action)),
      invalidatesTags: (_data, error, { action }) =>
        error
          ? []
          : action === "delete"
            ? [...changedTags]
            : [
                "AdminUser",
                "Report",
                "Profile",
                { type: "Dashboard", id: "TABLES" },
              ],
    }),

    resolveReport: build.mutation<
      ReportSignal,
      { id: string; decision: ReportDecision }
    >({
      queryFn: ({ id, decision }) =>
        request(() => adminApi.resolveReport(id, decision)),
      async onQueryStarted(
        { decision },
        { queryFulfilled, dispatch, getState },
      ) {
        const generation = sessionGeneration(getState());
        try {
          const { data } = await queryFulfilled;
          if (generation !== sessionGeneration(getState())) return;
          if (decision === "deleted" && data.targetType !== "users")
            removeCachedTweet(
              {
                type: data.targetType === "posts" ? "post" : "comment",
                id: data.targetId,
              },
              dispatch as AppDispatch,
              getState() as RootState,
            );
        } catch {
          /* Mutation errors are displayed by the caller. */
        }
      },

      invalidatesTags: (data, error, { decision }) =>
        error
          ? []
          : decision === "kept"
            ? [
                "Report",
                { type: "Dashboard", id: "METRICS" },
                { type: "Dashboard", id: "TABLES" },
              ]
            : decision === "blocked"
              ? [
                  "AdminUser",
                  "Report",
                  "Profile",
                  { type: "Dashboard", id: "METRICS" },
                  { type: "Dashboard", id: "TABLES" },
                ]
              : data?.targetType === "users"
                ? [...changedTags]
                : [
                    "Report",
                    "Dashboard",
                    "Profile",
                    "Post",
                    "List",
                    "History",
                    "Recommendation",
                  ],
    }),
  }),
});

export const {
  useAdminUsersQuery,
  useAdminUserQuery,
  useAdminReportsQuery,
  useAdminReportQuery,
  useAdminMetricsQuery,
  useAdminAnalyticsQuery,
  useAdminTablesQuery,
  useAdminUserActionMutation,
  useResolveReportMutation,
} = adminQueries;
