import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { appApi } from "@/store/api";
import { sessionChanged, sessionReducer } from "@/store/session";
import { authReducer } from "@/store/auth";
import { themeReducer } from "@/store/theme";
import { scheduledStatusReducer } from "@/store/scheduledStatus";
import "@/store/postsApi";
import "@/store/sharedApi";

export function createAppStore() {
  const listener = createListenerMiddleware();
  const store = configureStore({
    reducer: {
      [appApi.reducerPath]: appApi.reducer,
      session: sessionReducer,
      auth: authReducer,
      theme: themeReducer,
      scheduledStatus: scheduledStatusReducer,
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
