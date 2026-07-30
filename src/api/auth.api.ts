/** @format */
import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";
import type { User } from "@/types/user";
import { MOCK_ENABLED, mockAuthApi } from "@/api/mock";

const realAuthApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>(ENDPOINTS.auth.login, data, {
      skipAuth: true,
    }),

  register: (data: RegisterRequest) =>
    apiClient.post<AuthResponse>(ENDPOINTS.auth.register, data, {
      skipAuth: true,
    }),

  logout: () => apiClient.post<void>(ENDPOINTS.auth.logout),

  // Отримання поточного користувача за збереженим токеном
  me: () => apiClient.get<User>(ENDPOINTS.auth.me),
};

export const authApi = MOCK_ENABLED ? mockAuthApi : realAuthApi;
