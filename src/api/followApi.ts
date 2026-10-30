import { apiClient } from "@/api/httpClient";
import { ENDPOINTS } from "@/api/apiEndpoints";
import { mapUserRole } from "@/api/mappers/profileMapper";
import type {
  BackendUser,
  CursorPage,
  FollowRequest,
  RemoveFollower,
  UserShort,
} from "@/types";

import { MOCK_ENABLED } from "@/config/mockConfig";
import { mockFollowApi } from "@/mock/handlers/mockFollowApi";

function readUsers(response: unknown): UserShort[] {
  if (Array.isArray(response)) return (response as BackendUser<UserShort>[]).map(mapUserRole);

  if (
    response &&
    typeof response === "object" &&
    "items" in response &&
    Array.isArray(response.items)
  )
    return (response.items as BackendUser<UserShort>[]).map(mapUserRole);

  throw new Error("Некоректна відповідь списку підписок.");
}

export const realFollowApi = {
  follow: (data: FollowRequest) =>
    apiClient.post<void>(ENDPOINTS.follows.follow(data.targetUserId)),

  unfollow: (data: FollowRequest) =>
    apiClient.delete<void>(ENDPOINTS.follows.unfollow(data.targetUserId)),

  followers: async (userId: string) =>
    readUsers(
      await apiClient.get<CursorPage<BackendUser<UserShort>>>(
        ENDPOINTS.follows.followers(userId),
      ),
    ),

  following: async (userId: string) =>
    readUsers(
      await apiClient.get<CursorPage<BackendUser<UserShort>>>(
        ENDPOINTS.follows.following(userId),
      ),
    ),

  removeFollower: (data: RemoveFollower) =>
    apiClient.delete<void>(
      ENDPOINTS.follows.removeFollower(data.userId, data.followId),
    ),
};

export const followApi = MOCK_ENABLED ? mockFollowApi : realFollowApi;
