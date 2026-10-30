import { mapUserRole } from "@/features/profiles/api/mappers/profileMapper";
import { ENDPOINTS, apiClient } from "@/shared/api";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";
import { mockFollowApi } from "@/mock/handlers/mockFollowApi";

import type {
  BackendUser,
  FollowRequest,
  RemoveFollower,
  UserShort,
} from "@/features/profiles/types";
import type { CursorPage } from "@/shared/types";

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
