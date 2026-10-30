import { recommendationQueries } from "@/store/recommendationQueries";
import { useStore } from "react-redux";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store/store";

import type { TrendFeedbackReason, TrendFeedbackSource } from "@/types/recommendation";

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
