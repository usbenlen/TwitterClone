/** @format */

import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { MOCK_ENABLED, mockFollowApi } from "@/mock/handlers";

import type { FollowRequest, FollowUser, RemoveFollower } from "@/types";

export const realFollowApi = {
  follow: (data: FollowRequest) =>
    apiClient.post<void>(ENDPOINTS.follows.follow(data.targetUserId)),

  unfollow: (data: FollowRequest) =>
    apiClient.delete<void>(ENDPOINTS.follows.unfollow(data.targetUserId)),

  followers: (userId: string) =>
    apiClient.get<FollowUser[]>(ENDPOINTS.follows.followers(userId)),

  following: (userId: string) =>
    apiClient.get<FollowUser[]>(ENDPOINTS.follows.following(userId)),

  removeFollower: (data: RemoveFollower) =>
    apiClient.delete<void>(
      ENDPOINTS.follows.removeFollower(data.userId, data.followId),
    ),
};

export const followApi = MOCK_ENABLED ? mockFollowApi : realFollowApi;
