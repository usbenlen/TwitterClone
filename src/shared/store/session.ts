import { createSlice } from "@reduxjs/toolkit";

const sessionSlice = createSlice({
  name: "session",
  initialState: { generation: 0 },
  reducers: {
    sessionChanged(state) {
      state.generation += 1;
    },
  },
});

export const { sessionChanged } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
export const sessionGeneration = (state: unknown) =>
  (state as { session: { generation: number } }).session.generation;
