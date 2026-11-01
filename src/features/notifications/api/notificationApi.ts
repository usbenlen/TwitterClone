import { mapNotification } from "@/features/notifications/api/mappers/notificationMapper";

import { ENDPOINTS } from "@/shared/api/apiEndpoints";
import { apiClient } from "@/shared/api/httpClient";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";

import { mockNotificationsApi } from "@/mock/handlers/mockNotificationsApi";

import type { NotificationsApi } from "@/features/notifications/types/notification";
import type {
  BackendNotification,
  BackendUnreadNotificationCount,
} from "@/features/notifications/types/notification.dto";
import type { CursorPage } from "@/shared/types/api";

const realNotificationsApi: NotificationsApi = {
  async list(tab, limit, cursor) {
    if (tab === "mentions")
      throw new Error("Фільтр згадок поки не підтримується сервером.");

    const params = new URLSearchParams({ limit: String(limit) });

    if (cursor) params.set("cursor", cursor);

    const page = await apiClient.get<CursorPage<BackendNotification>>(
      `${ENDPOINTS.notifications.list}?${params}`,
    );

    return { ...page, items: page.items.map(mapNotification) };
  },

  unreadCount: async () => {
    const response = await apiClient.get<BackendUnreadNotificationCount>(
      ENDPOINTS.notifications.unreadCount,
    );
    return { count: response.unreadCount };
  },
  read: (id) => apiClient.patch<void>(ENDPOINTS.notifications.read(id)),
  readAll: () => apiClient.patch<void>(ENDPOINTS.notifications.readAll),
  preferences: () => apiClient.get(ENDPOINTS.notifications.preferences),
  updatePreferences: (patch) =>
    apiClient.patch(ENDPOINTS.notifications.preferences, patch),
};

export const notificationsApi: NotificationsApi = MOCK_ENABLED
  ? mockNotificationsApi
  : realNotificationsApi;
