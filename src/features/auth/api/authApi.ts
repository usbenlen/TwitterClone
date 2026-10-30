import { mapUserRole } from "@/features/profiles/api/mappers/profileMapper";
import { ENDPOINTS, apiClient } from "@/shared/api";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";
import { tokenStorage } from "@/shared/lib/tokenStorage";
import { mockAuthApi } from "@/mock/handlers/mockAuthApi";

import type {
  AuthResponse,
  ConfirmPasswordChangeRequest,
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResendVerificationCodeRequest,
  ResetPasswordRequest,
  StartPasswordChangeRequest,
  VerifyEmailRequest,
  VerifyResetCodeRequest,
} from "@/features/auth/types";
import type { BackendUser, User } from "@/features/profiles/types";

const realAuthApi = {
  loginWithGoogle: (data: GoogleLoginRequest, signal?: AbortSignal) =>
    apiClient.post<AuthResponse>(ENDPOINTS.auth.google, data, {
      skipAuth: true,
      signal,
    }),

  linkGoogle: (data: GoogleLoginRequest, signal?: AbortSignal) =>
    apiClient.post<void>(ENDPOINTS.auth.googleLink, data, { signal }),

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
  me: (signal?: AbortSignal) =>
    apiClient.get<BackendUser<User>>(ENDPOINTS.auth.me, { signal }).then(mapUserRole),

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
