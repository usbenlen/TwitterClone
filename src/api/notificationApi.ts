import { apiClient } from "@/api/httpClient";
import { ENDPOINTS } from "@/api/apiEndpoints";
import { mapNotification } from "@/api/mappers/notificationMapper";

import type {
  BackendNotification,
  NotificationsApi,
  NotificationsPage,
} from "@/types";

import { MOCK_ENABLED } from "@/config/mockConfig";
import { mockNotificationsApi } from "@/mock/handlers/mockNotificationsApi";

const realNotificationsApi: NotificationsApi = {
  async list(tab, limit, cursor) {
    const params = new URLSearchParams({ tab, limit: String(limit) });

    if (cursor) params.set("cursor", cursor);

    const page = await apiClient.get<
      Omit<NotificationsPage, "items"> & { items: BackendNotification[] }
    >(`${ENDPOINTS.notifications.list}?${params}`);

    return { ...page, items: page.items.map(mapNotification) };
  },

  unreadCount: () => apiClient.get(ENDPOINTS.notifications.unreadCount),
  read: (id, readThrough) => apiClient.post<void>(ENDPOINTS.notifications.read(id), { readThrough }),
  readAll: (readThrough) => apiClient.post<void>(ENDPOINTS.notifications.readAll, { readThrough }),
  preferences: () => apiClient.get(ENDPOINTS.notifications.preferences),
  updatePreferences: (patch) => apiClient.patch(ENDPOINTS.notifications.preferences, patch),
};

export const notificationsApi: NotificationsApi = MOCK_ENABLED
  ? mockNotificationsApi
  : realNotificationsApi;
