import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import {
  mapNotification,
  type BackendNotification,
} from "@/api/mappers/notification.mapper";

import { MOCK_ENABLED } from "@/mock/config";
import { mockNotificationsApi } from "@/mock/handlers/mockNotificationsApi";

import type { NotificationsApi, NotificationsPage } from "@/types/notification";

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
