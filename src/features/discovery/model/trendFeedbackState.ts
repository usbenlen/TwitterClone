import { createSlice } from "@reduxjs/toolkit";

import { sessionChanged } from "@/shared/store/session";

import type { PayloadAction } from "@reduxjs/toolkit";
import type {
  TrendFeedbackReason,
  TrendFeedbackRequest,
  TrendFeedbackSource,
} from "@/features/discovery/types";

interface TrendFeedbackState {
  hidden: Record<string, TrendFeedbackReason>;
  pending: Record<string, string>;
  errors: Partial<Record<TrendFeedbackSource, string>>;
}

const initialState: TrendFeedbackState = { hidden: {}, pending: {}, errors: {} };

const trendFeedbackSlice = createSlice({
  name: "trendFeedback",
  initialState,
  reducers: {
    trendDismissed(
      state,
      {
        payload,
      }: PayloadAction<TrendFeedbackRequest & {
        requestId: string;
        source: TrendFeedbackSource;
      }>,
    ) {
      state.hidden[payload.trendId] = payload.reason;
      state.pending[payload.trendId] = payload.requestId;
      delete state.errors[payload.source];
    },
    trendFeedbackCompleted(
      state,
      { payload }: PayloadAction<{ trendId: string; requestId: string }>,
    ) {
      if (state.pending[payload.trendId] !== payload.requestId) return;
      delete state.pending[payload.trendId];
    },
    trendFeedbackFailed(
      state,
      { payload }: PayloadAction<{
        trendId: string;
        requestId: string;
        source: TrendFeedbackSource;
        message: string;
      }>,
    ) {
      if (state.pending[payload.trendId] !== payload.requestId) return;
      delete state.pending[payload.trendId];
      delete state.hidden[payload.trendId];
      state.errors[payload.source] = payload.message;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionChanged, () => initialState);
  },
});

export const { trendDismissed, trendFeedbackCompleted, trendFeedbackFailed } = trendFeedbackSlice.actions;
export const trendFeedbackReducer = trendFeedbackSlice.reducer;
