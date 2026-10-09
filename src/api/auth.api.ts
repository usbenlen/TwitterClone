import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import type {
  AuthResponse,
  ConfirmPasswordChangeRequest,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  ResetPasswordRequest,
  RegisterRequest,
  VerifyResetCodeRequest,
  VerifyEmailRequest,
  ResendVerificationCodeRequest,
  StartPasswordChangeRequest,
} from "@/types/auth";
import type { User } from "@/types/user";
import { MOCK_ENABLED } from "@/mock/config";
import { mockAuthApi } from "@/mock/handlers";
import { tokenStorage } from "@/utils/storage";

const realAuthApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>(ENDPOINTS.auth.login, data, {
      skipAuth: true,
    }),

  register: (data: RegisterRequest) =>
    apiClient.post<MessageResponse>(ENDPOINTS.auth.register, data, {
      skipAuth: true,
    }),

  verifyEmail: (data: VerifyEmailRequest) =>
    apiClient.post<AuthResponse>(ENDPOINTS.auth.verifyEmail, data, {
      skipAuth: true,
    }),

  resendVerificationCode: (data: ResendVerificationCodeRequest) =>
    apiClient.post<MessageResponse>(
      ENDPOINTS.auth.resendVerificationCode,
      data,
      {
        skipAuth: true,
      },
    ),

  logout: async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return;

    await apiClient.post<void>(
      ENDPOINTS.auth.logout,
      { refreshToken },
      { skipAuth: true },
    );
  },

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

  startPasswordChange: (data: StartPasswordChangeRequest) =>
    apiClient.post<MessageResponse>(ENDPOINTS.auth.changePasswordStart, data),

  confirmPasswordChange: (data: ConfirmPasswordChangeRequest) =>
    apiClient.post<MessageResponse>(ENDPOINTS.auth.changePasswordConfirm, data),
};

export const authApi = MOCK_ENABLED ? mockAuthApi : realAuthApi;
