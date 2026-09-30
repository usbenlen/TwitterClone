import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, isLoading: true } as AuthState,
  reducers: {
    authReady(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isLoading = false;
    },
    authCleared(state) {
      state.user = null;
      state.isLoading = false;
    },
    authUserUpdated(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
});

export const { authReady, authCleared, authUserUpdated } = authSlice.actions;
export const authReducer = authSlice.reducer;
