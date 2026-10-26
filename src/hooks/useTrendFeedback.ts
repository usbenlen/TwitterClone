import { useStore } from "react-redux";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sharedApi } from "@/store/sharedApi";
import type { RootState } from "@/store";
import type { TrendFeedbackSource } from "@/store/trendFeedback";

import type { TrendFeedbackReason } from "@/types/recommendations";

export function useTrendFeedback(source: TrendFeedbackSource) {
  const store = useStore<RootState>();
  const dispatch = useAppDispatch();
  const feedbackError = useAppSelector((state) => state.trendFeedback.errors[source]);

  const dismissTrend = (trendId: string, reason: TrendFeedbackReason) => {
    if (Object.hasOwn(store.getState().trendFeedback.pending, trendId)) return;
    // No mutation subscription is needed: the session-scoped slice owns the result.
    void dispatch(
      sharedApi.endpoints.sendTrendFeedback.initiate(
        { trendId, reason, source },
        { track: false },
      ),
    );
  };

  return { dismissTrend, feedbackError };
}
