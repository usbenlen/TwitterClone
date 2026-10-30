import { useStore } from "react-redux";

import { recommendationQueries } from "@/features/discovery/api/recommendationQueries";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";

import type { RootState } from "@/app/store/store";
import type {
  TrendFeedbackReason,
  TrendFeedbackSource,
} from "@/features/discovery/types";

export function useTrendFeedback(source: TrendFeedbackSource) {
  const store = useStore<RootState>();
  const dispatch = useAppDispatch();
  const feedbackError = useAppSelector((state) => state.trendFeedback.errors[source]);

  const dismissTrend = (trendId: string, reason: TrendFeedbackReason) => {
    if (Object.hasOwn(store.getState().trendFeedback.pending, trendId)) return;
    // No mutation subscription is needed: the session-scoped slice owns the result.
    void dispatch(
      recommendationQueries.endpoints.sendTrendFeedback.initiate(
        { trendId, reason, source },
        { track: false },
      ),
    );
  };

  return { dismissTrend, feedbackError };
}
