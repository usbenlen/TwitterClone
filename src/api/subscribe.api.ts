import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import type { SubscribeRequest } from "@/types/subscribe";
import { MOCK_ENABLED, mockSubscribeApi } from "@/api/mock";


export const realSubscribeApi = {
    subscribe: (data: SubscribeRequest) =>
        apiClient.post<void>(ENDPOINTS.subscribe.subscribe, data),

    unsubscribe: (data: SubscribeRequest) =>
        apiClient.post<void>(ENDPOINTS.subscribe.unsubscribe, data),

    getSubscriptionsByUsername: (username: string) =>
        apiClient.get<void>(ENDPOINTS.subscribe.byUsername(username))
};

export const subscribeApi = MOCK_ENABLED ? mockSubscribeApi : realSubscribeApi;

