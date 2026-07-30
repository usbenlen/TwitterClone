/** @format */
import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import type { User } from "@/types/user";
import { MOCK_ENABLED, mockUserApi } from "@/api/mock";

const realUserApi = {
  getByUsername: (username: string) =>
    apiClient.get<User>(ENDPOINTS.users.byUsername(username)),
};

export const userApi = MOCK_ENABLED ? mockUserApi : realUserApi;
