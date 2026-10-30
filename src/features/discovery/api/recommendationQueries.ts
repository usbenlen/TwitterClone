import { recommendationsApi } from "@/features/discovery/api/recommendationApi";
import {
  trendDismissed,
  trendFeedbackCompleted,
  trendFeedbackFailed,
} from "@/features/discovery/model/trendFeedbackState";
import { appApi, errorMessage, request } from "@/shared/store/appApi";
import { sessionGeneration } from "@/shared/store/session";

import type {
  ExploreCategory,
  PaginatedRecommendations,
  TrendFeedbackRequest,
  TrendFeedbackSource,
  TrendRecommendationsResponse,
} from "@/features/discovery/types";

export const recommendationQueries = appApi.injectEndpoints({
  endpoints: (build) => ({
    getTrends: build.query<TrendRecommendationsResponse, number>({
      queryFn: (limit) => request(() => recommendationsApi.trends(limit)),
      providesTags: [{ type: "Recommendation", id: "TRENDS" }],
    }),

    getExploreTrends: build.query<TrendRecommendationsResponse, { category: ExploreCategory; limit: number }>({
      queryFn: ({ category, limit }) => request(() => recommendationsApi.explore(category, limit)),
      providesTags: [{ type: "Recommendation", id: "TRENDS" }],
    }),

    sendTrendFeedback: build.mutation<void, TrendFeedbackRequest & { source: TrendFeedbackSource }>({
      queryFn: ({ trendId, reason }) => request(() => recommendationsApi.feedback({ trendId, reason })),

      async onQueryStarted({ trendId, reason, source }, lifecycle) {
        const generation = sessionGeneration(lifecycle.getState());
        const requestId = lifecycle.requestId;
        lifecycle.dispatch(trendDismissed({ trendId, reason, source, requestId }));
        try {
          await lifecycle.queryFulfilled;
          if (generation !== sessionGeneration(lifecycle.getState())) return;

          lifecycle.dispatch(trendFeedbackCompleted({ trendId, requestId }));
          lifecycle.dispatch(recommendationQueries.util.invalidateTags([{ type: "Recommendation", id: "TRENDS" }]));
        } catch (failure) {
          if (generation !== sessionGeneration(lifecycle.getState())) return;

          const error = (failure as { error?: unknown }).error;
          lifecycle.dispatch(
            trendFeedbackFailed({
              trendId,
              requestId,
              source,
              message: `Не вдалося зберегти відгук. ${errorMessage(error)}`,
            }),
          );
        }
      },
    }),

    getRecommendedUsers: build.infiniteQuery<PaginatedRecommendations, number, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (page) => page.hasMore ? page.nextCursor ?? undefined : undefined,
      },
      queryFn: ({ queryArg, pageParam }) =>
        request(() => recommendationsApi.users(queryArg, pageParam),
        ),
      providesTags: [{ type: "Recommendation", id: "USERS" }],
    }),
  }),
});

export const {
  useGetTrendsQuery,
  useGetExploreTrendsQuery,
  useGetRecommendedUsersInfiniteQuery,
} = recommendationQueries;
