import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { MOCK_ENABLED, mockFollowApi } from "@/mock/handlers/index";

import type {
  CursorPage,
  FollowRequest,
  UserShort,
  RemoveFollower,
} from "@/types";

function readUsers(response: unknown): UserShort[] {
  if (Array.isArray(response)) return response as UserShort[];

  if (
    response &&
    typeof response === "object" &&
    "items" in response &&
    Array.isArray(response.items)
  )
    return response.items as UserShort[];

  throw new Error("Некоректна відповідь списку підписок.");
}

export const realFollowApi = {
  follow: (data: FollowRequest) =>
    apiClient.post<void>(ENDPOINTS.follows.follow(data.targetUserId)),

  unfollow: (data: FollowRequest) =>
    apiClient.delete<void>(ENDPOINTS.follows.unfollow(data.targetUserId)),

  followers: async (userId: string) =>
    readUsers(
      await apiClient.get<CursorPage<UserShort>>(
        ENDPOINTS.follows.followers(userId),
      ),
    ),

  following: async (userId: string) =>
    readUsers(
      await apiClient.get<CursorPage<UserShort>>(
        ENDPOINTS.follows.following(userId),
      ),
    ),

  removeFollower: (data: RemoveFollower) =>
    apiClient.delete<void>(
      ENDPOINTS.follows.removeFollower(data.userId, data.followId),
    ),
};

export const followApi = MOCK_ENABLED ? mockFollowApi : realFollowApi;
