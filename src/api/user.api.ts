import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import {
  mapInteractionCollection,
  mapPostToTweet,
  type BackendInteractionCollection,
  type BackendPost,
} from "@/api/mappers/post.mapper";

import { MOCK_ENABLED } from "@/mock/config";
import { mockUserApi } from "@/mock/handlers";

import type { Location, User } from "@/types";

export interface UpdateProfileRequest {
  displayName?: string | null;
  bio?: string | null;

  location?: Location | null;
  removeLocation?: boolean;

  avatar?: File | null;
  removeAvatar?: boolean;

  banner?: File | null;
  removeBanner?: boolean;
}

const realUserApi = {
  getById: (id: string) => apiClient.get<User>(ENDPOINTS.users.byId(id)),

  getByUsername: (username: string) =>
    apiClient.get<User>(ENDPOINTS.users.byUsername(username)),

  getPosts: async (username: string) => {
    const posts = await apiClient.get<BackendPost[]>(
      ENDPOINTS.users.posts(username),
    );

    return posts.map(mapPostToTweet);
  },

  getLikes: async (username: string) => {
    const collection = await apiClient.get<BackendInteractionCollection>(
      ENDPOINTS.users.likes(username),
    );

    return mapInteractionCollection(collection);
  },

  getReposts: async (username: string) => {
    const collection = await apiClient.get<BackendInteractionCollection>(
      ENDPOINTS.users.reposts(username),
    );

    return mapInteractionCollection(collection);
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    const formData = new FormData();

    if (data.displayName !== undefined)
      formData.append("DisplayName", data.displayName ?? "");

    if (data.bio !== undefined) formData.append("Bio", data.bio ?? "");

    formData.append("RemoveLocation", String(data.removeLocation ?? false));

    if (data.location && !data.removeLocation) {
      formData.append(
        "Location",
        JSON.stringify({
          id: data.location.id,
          name: data.location.name,
          country: data.location.country,
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        }),
      );
    }

    formData.append("RemoveAvatar", String(data.removeAvatar ?? false));
    formData.append("RemoveBanner", String(data.removeBanner ?? false));

    if (data.avatar) formData.append("Avatar", data.avatar);
    if (data.banner) formData.append("Banner", data.banner);

    return apiClient.put<User>(ENDPOINTS.users.updateProfile, formData);
  },

  deleteMe: () => apiClient.delete(ENDPOINTS.users.deleteMe),
};

export const userApi = MOCK_ENABLED ? mockUserApi : realUserApi;
