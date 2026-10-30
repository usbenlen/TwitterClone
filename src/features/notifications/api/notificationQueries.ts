import { notificationsApi } from "@/features/notifications/api/notificationApi";
import { NOTIFICATIONS_PAGE_SIZE } from "@/features/notifications/constants/notification";
import { appApi, request } from "@/shared/store/appApi";

import type {
  NotificationPreferences,
  NotificationTab,
  NotificationsPage,
} from "@/features/notifications/types";

export const notificationsQueryApi = appApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.infiniteQuery<
      NotificationsPage,
      NotificationTab,
      string | null
    >({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (page) => page.hasMore ? (page.nextCursor ?? undefined) : undefined,
      },
      queryFn: ({ queryArg, pageParam }) =>
        request(() =>
          notificationsApi.list(queryArg, NOTIFICATIONS_PAGE_SIZE, pageParam),
        ),
      providesTags: [{ type: "Notification", id: "LIST" }],
    }),
    getUnreadNotificationsCount: build.query<{ count: number }, void>({
      queryFn: () => request(() => notificationsApi.unreadCount()),
      providesTags: [{ type: "Notification", id: "COUNT" }],
    }),
    markNotificationRead: build.mutation<
      void,
      { id: string; readThrough: string }
    >({
      queryFn: ({ id, readThrough }) => request(() => notificationsApi.read(id, readThrough)),
      invalidatesTags: (_data, error) => (error ? [] : ["Notification"]),
    }),
    markAllNotificationsRead: build.mutation<void, string>({
      queryFn: (readThrough) => request(() => notificationsApi.readAll(readThrough)),
      invalidatesTags: (_data, error) => (error ? [] : ["Notification"]),
    }),
    getNotificationPreferences: build.query<NotificationPreferences, void>({
      queryFn: () => request(() => notificationsApi.preferences()),
      providesTags: ["NotificationPreferences"],
    }),
    updateNotificationPreferences: build.mutation<
      NotificationPreferences,
      Partial<NotificationPreferences>
    >({
      queryFn: (patch) => request(() => notificationsApi.updatePreferences(patch)),
      invalidatesTags: (_data, error) =>
        error ? [] : ["NotificationPreferences"],
    }),
  }),
});

export const {
  useGetNotificationsInfiniteQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = notificationsQueryApi;
