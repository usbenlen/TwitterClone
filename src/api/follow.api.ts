import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import type { FollowRequest, RemoveFollower, FollowUser } from "@/types/follow";
import { MOCK_ENABLED, mockFollowApi } from "@/api/mock";

export const realFollowApi = {
    follow: (data: FollowRequest) =>
        apiClient.post<void>(ENDPOINTS.follows.follow(data.targetUserId), data),

    unfollow: (data: FollowRequest) =>
        apiClient.post<void>(ENDPOINTS.follows.unfollow(data.targetUserId), data),

    followers: (userId: string) =>
        apiClient.get<FollowUser[]>(ENDPOINTS.follows.followers(userId)
    ),

    following: (userId: string) =>
        apiClient.get<FollowUser[]>(ENDPOINTS.follows.following(userId)
    ),

    removeFollower: (data: RemoveFollower) => 
        apiClient.post<void>(ENDPOINTS.follows.removeFollower(data.userId, data.followId)
    ),
};

export const followApi = MOCK_ENABLED ? mockFollowApi : realFollowApi;

