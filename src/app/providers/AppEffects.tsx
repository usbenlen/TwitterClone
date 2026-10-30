import { setupListeners } from "@reduxjs/toolkit/query";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useEffect, useRef } from "react";

import { authApi } from "@/features/auth/api";
import { authCleared, authReady } from "@/features/auth/model/authState";
import { postsApi } from "@/features/content/api/postQueries";
import { useGetUnreadNotificationsCountQuery } from "@/features/notifications/api/notificationQueries";
import { useNotificationPollingOptions } from "@/features/notifications/hooks/useNotificationPollingOptions";
import {
  THEME_STORAGE_KEY,
  systemTheme,
} from "@/features/preferences/model/themeState";
import {
  useGetFollowersQuery,
  useGetFollowingQuery,
} from "@/features/profiles/api/followQueries";
import { useGetScheduledPostsQuery } from "@/features/scheduling/api/scheduleQueries";
import {
  SCHEDULE_CHECK_INTERVAL_MS,
  SCHEDULE_MIN_CHECK_DELAY_MS,
} from "@/features/scheduling/constants/schedule";
import { publishScheduled } from "@/features/scheduling/model/publishScheduled";
import { clearUnauthorizedHandler, setUnauthorizedHandler } from "@/shared/api";
import { tokenStorage } from "@/shared/lib/tokenStorage";
import {
  useAppDispatch,
  useAppSelector,
  useAppStore,
} from "@/shared/store/hooks";
import { sessionChanged, sessionGeneration } from "@/shared/store/session";

export function AppEffects() {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const theme = useAppSelector((state) => state.theme.value);
  const user = useAppSelector((state) => state.auth.user);
  const lastStartedUserId = useRef<string | null>(null);
  useGetFollowingQuery(user?.id ?? skipToken);
  useGetFollowersQuery(user?.id ?? skipToken);
  const scheduled = useGetScheduledPostsQuery(undefined, { skip: !user });
  const notificationPolling = useNotificationPollingOptions();
  useGetUnreadNotificationsCountQuery(undefined, {
    ...notificationPolling,
    skip: !user,
  });

  useEffect(() => setupListeners(dispatch), [dispatch]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStorage.clear();
      dispatch(sessionChanged());
      dispatch(authCleared());
    });

    const generation = sessionGeneration(store.getState());

    if (!tokenStorage.hasTokens()) dispatch(authCleared());
    else
      void authApi.me().then(
        (currentUser) => {
          if (generation === sessionGeneration(store.getState()))
            dispatch(authReady(currentUser));
        },
        () => {
          if (generation === sessionGeneration(store.getState())) {
            tokenStorage.clear();
            dispatch(authCleared());
          }
        },
      );
    return () => clearUnauthorizedHandler();
  }, [dispatch, store]);

  useEffect(() => {
    const apply = () =>
      document.documentElement.setAttribute(
        "data-theme",
        theme === "system" ? systemTheme() : theme,
      );
    apply();
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const publishDue = () => publishScheduled(store, () => active);
    const nextTime = scheduled.data?.[0]
      ? Date.parse(scheduled.data[0].scheduledAt)
      : Date.now() + SCHEDULE_CHECK_INTERVAL_MS;
    const delay = Math.max(
      SCHEDULE_MIN_CHECK_DELAY_MS,
      Math.min(SCHEDULE_CHECK_INTERVAL_MS, nextTime - Date.now()),
    );
    const timer = window.setTimeout(() => void publishDue(), delay);

    if (lastStartedUserId.current !== user.id) {
      lastStartedUserId.current = user.id;
      void publishDue();
    }

    const onFocus = () => void publishDue();
    const onStorage = () =>
      dispatch(
        postsApi.util.invalidateTags([{ type: "Scheduled", id: "LIST" }]),
      );

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      window.clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [dispatch, scheduled.data, store, user]);

  useEffect(() => {
    if (!user) lastStartedUserId.current = null;
  }, [user]);

  return null;
}
