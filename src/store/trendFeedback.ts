import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { sessionChanged } from "@/store/session";
import type { TrendFeedbackReason } from "@/types/recommendations";

interface TrendFeedbackState {
  hidden: Record<string, TrendFeedbackReason>;
}

const initialState: TrendFeedbackState = { hidden: {} };

const trendFeedbackSlice = createSlice({
  name: "trendFeedback",
  initialState,
  reducers: {
    trendDismissed(
      state,
      {
        payload,
      }: PayloadAction<{ trendId: string; reason: TrendFeedbackReason }>,
    ) {
      state.hidden[payload.trendId] = payload.reason;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionChanged, () => initialState);
  },
});

export const { trendDismissed } = trendFeedbackSlice.actions;
export const trendFeedbackReducer = trendFeedbackSlice.reducer;
