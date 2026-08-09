/** @format */

import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { MOCK_ENABLED } from "@/mock/config";
import { mockUserApi } from "@/mock/handlers";

import type { Location, User } from "@/types";

export interface UpdateProfileRequest {
  displayName: string;
  bio?: string;
  location?: Location | null;
  avatar?: File | null;
  banner?: File | null;
}

const realUserApi = {
  getByUsername: (username: string) =>
    apiClient.get<User>(ENDPOINTS.users.byUsername(username)),

  updateProfile: (data: UpdateProfileRequest) => {
    const formData = new FormData();

    formData.append("displayName", data.displayName);

    if (data.bio !== undefined) formData.append("bio", data.bio);
    if (data.location !== undefined) {
      formData.append(
        "location",
        data.location ? JSON.stringify(data.location) : "",
      );
    }

    if (data.avatar) formData.append("avatar", data.avatar);
    if (data.banner) formData.append("banner", data.banner);

    return apiClient.post<User>(ENDPOINTS.users.updateProfile, formData);
  },
};

export const userApi = MOCK_ENABLED ? mockUserApi : realUserApi;
