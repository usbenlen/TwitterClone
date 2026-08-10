/** @format */
import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import type {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  ResetPasswordRequest,
  RegisterRequest,
  VerifyResetCodeRequest,
} from "@/types/auth";
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

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient.post<MessageResponse>(ENDPOINTS.auth.forgotPassword, data, {
      skipAuth: true,
    }),

  verifyResetCode: (data: VerifyResetCodeRequest) =>
    apiClient.post<MessageResponse>(ENDPOINTS.auth.verifyResetCode, data, {
      skipAuth: true,
    }),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<MessageResponse>(ENDPOINTS.auth.resetPassword, data, {
      skipAuth: true,
    }),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<MessageResponse>(ENDPOINTS.auth.changePassword, data),
};

export const authApi = MOCK_ENABLED ? mockAuthApi : realAuthApi;
