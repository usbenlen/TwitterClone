import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import type { FollowRequest } from "@/types/follow";
import { MOCK_ENABLED, mockFollowApi } from "@/api/mock";

export const realFollowApi = {
    follow: (data: FollowRequest) =>
        apiClient.post<void>(ENDPOINTS.follows.follow(data.targetUserId), data),

    unfollow: (data: FollowRequest) =>
        apiClient.post<void>(ENDPOINTS.follows.unfollow(data.targetUserId), data),

};

export const followApi = MOCK_ENABLED ? mockFollowApi : realFollowApi;

