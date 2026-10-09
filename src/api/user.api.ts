import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import {
  getMappedInteractionPage,
  getMappedPostPage,
} from "@/api/mappers/post.mapper";

import { MOCK_ENABLED } from "@/mock/config";
import { mockUserApi } from "@/mock/handlers";

import type { BirthDateVisibility, Location, User } from "@/types";

export interface UpdateProfileRequest {
  displayName?: string | null;
  bio?: string | null;

  location?: Location | null;
  removeLocation?: boolean;

  birthDate?: string | null;
  birthDateVisibility?: BirthDateVisibility;
  birthYearVisibility?: BirthDateVisibility;
  removeBirthDate?: boolean;

  avatar?: File | null;
  removeAvatar?: boolean;

  banner?: File | null;
  removeBanner?: boolean;
}

const realUserApi = {
  getById: (id: string) => apiClient.get<User>(ENDPOINTS.users.byId(id)),

  getByUsername: (username: string) =>
    apiClient.get<User>(ENDPOINTS.users.byUsername(username)),

  getPosts: async (username: string) =>
    (await getMappedPostPage(ENDPOINTS.users.posts(username))).items,

  getLikes: async (username: string) =>
    (await getMappedInteractionPage(ENDPOINTS.users.likes(username))).items,

  getReposts: async (username: string) =>
    (await getMappedInteractionPage(ENDPOINTS.users.reposts(username))).items,

  getReplies: async (username: string) =>
    (await getMappedPostPage(ENDPOINTS.users.replies(username))).items,

  updateProfile: async (data: UpdateProfileRequest) => {
    const formData = new FormData();

    if (data.displayName !== undefined)
      formData.append("DisplayName", data.displayName ?? "");

    if (data.bio !== undefined) formData.append("Bio", data.bio ?? "");

    if (data.removeLocation) formData.append("RemoveLocation", "true");

    if (data.location && !data.removeLocation) {
      formData.append("Location.Id", data.location.id);
      formData.append("Location.Name", data.location.name);
      formData.append("Location.Country", data.location.country);
      formData.append("Location.Latitude", String(data.location.latitude));
      formData.append("Location.Longitude", String(data.location.longitude));
    }

    if (data.removeBirthDate) formData.append("RemoveBirthDate", "true");

    if (data.birthDate !== undefined && !data.removeBirthDate)
      formData.append("BirthDate", data.birthDate ?? "");

    if (data.birthDateVisibility !== undefined)
      formData.append("BirthDateVisibility", data.birthDateVisibility);

    if (data.birthYearVisibility !== undefined)
      formData.append("BirthYearVisibility", data.birthYearVisibility);

    if (data.removeAvatar) formData.append("RemoveAvatar", "true");
    if (data.removeBanner) formData.append("RemoveBanner", "true");

    if (data.avatar) formData.append("Avatar", data.avatar);
    if (data.banner) formData.append("Banner", data.banner);

    const updatedUser = await apiClient.put<User>(
      ENDPOINTS.users.updateProfile,
      formData,
    );

    const birthDateChanged =
      data.birthDate !== undefined || Boolean(data.removeBirthDate);

    return {
      ...updatedUser,
      ...(birthDateChanged && !("birthDate" in updatedUser)
        ? { birthDate: data.removeBirthDate ? null : data.birthDate }
        : {}),
      ...(data.birthDateVisibility !== undefined &&
      !("birthDateVisibility" in updatedUser)
        ? { birthDateVisibility: data.birthDateVisibility }
        : {}),
      ...(data.birthYearVisibility !== undefined &&
      !("birthYearVisibility" in updatedUser)
        ? { birthYearVisibility: data.birthYearVisibility }
        : {}),
    };
  },

  deleteMe: () => apiClient.delete(ENDPOINTS.users.deleteMe),
};

export const userApi = MOCK_ENABLED ? mockUserApi : realUserApi;
