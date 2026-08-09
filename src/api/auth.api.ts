/** @format */
import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";
import type { User } from "@/types/user";
import { MOCK_ENABLED } from "@/mock/config";
import { mockAuthApi } from "@/mock/handlers";

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

  forgotPassword: (email: string) =>
    apiClient.post(
      ENDPOINTS.auth.forgotPassword,
      { email },
      { skipAuth: true },
    ),

  verifyResetCode: (email: string, code: string) =>
    apiClient.post(
      ENDPOINTS.auth.verifyResetCode,
      {
        email,
        code,
      },
      { skipAuth: true },
    ),

  resetPassword: (email: string, code: string, password: string) =>
    apiClient.post(
      ENDPOINTS.auth.resetPassword,
      {
        email,
        code,
        password,
      },
      { skipAuth: true },
    ),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post<void>(ENDPOINTS.auth.changePassword, data),
};

export const authApi = MOCK_ENABLED ? mockAuthApi : realAuthApi;
