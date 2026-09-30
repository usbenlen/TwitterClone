import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { sessionChanged } from "@/store/session";

const scheduledStatusSlice = createSlice({
  name: "scheduledStatus",
  initialState: { error: null as string | null },
  reducers: {
    scheduledErrorSet(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    scheduledErrorCleared(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) =>
    builder.addCase(sessionChanged, (state) => {
      state.error = null;
    }),
});

export const { scheduledErrorSet, scheduledErrorCleared } =
  scheduledStatusSlice.actions;
export const scheduledStatusReducer = scheduledStatusSlice.reducer;
