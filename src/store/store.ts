import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";

import { appApi } from "@/store/appApi";
import { sessionChanged, sessionReducer } from "@/store/session";
import { authReducer } from "@/store/authState";
import { themeReducer } from "@/store/themeState";
import { scheduledStatusReducer } from "@/store/scheduleState";
import { trendFeedbackReducer } from "@/store/trendFeedbackState";
import "@/store/posts/postQueries";
import "@/store/profileQueries";
import "@/store/followQueries";
import "@/store/recommendationQueries";
import "@/store/scheduleQueries";

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
