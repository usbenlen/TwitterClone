import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";

import { authReducer } from "@/features/auth/model/authState";
import { trendFeedbackReducer } from "@/features/discovery/model/trendFeedbackState";
import { themeReducer } from "@/features/preferences/model/themeState";
import { scheduledStatusReducer } from "@/features/scheduling/model/scheduleState";
import { appApi } from "@/shared/store/appApi";
import { sessionChanged, sessionReducer } from "@/shared/store/session";

import "@/features/content/api/postQueries";
import "@/features/profiles/api/profileQueries";
import "@/features/profiles/api/followQueries";
import "@/features/discovery/api/recommendationQueries";
import "@/features/scheduling/api/scheduleQueries";

export function createAppStore() {
  const listener = createListenerMiddleware();
  const store = configureStore({
    reducer: {
      [appApi.reducerPath]: appApi.reducer,
      session: sessionReducer,
      auth: authReducer,
      theme: themeReducer,
      scheduledStatus: scheduledStatusReducer,
      trendFeedback: trendFeedbackReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(listener.middleware)
        .concat(appApi.middleware),
  });
  listener.startListening({
    actionCreator: sessionChanged,
    effect: () => {
      const requests = [
        ...store.dispatch(appApi.util.getRunningQueriesThunk()),
        ...store.dispatch(appApi.util.getRunningMutationsThunk()),
      ];
      requests.forEach((request) => request.abort());
      store.dispatch(appApi.util.resetApiState());
    },
  });
  return store;
}

export const store = createAppStore();
export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
