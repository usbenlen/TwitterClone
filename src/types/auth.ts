/** @format */

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  displayName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  username: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword?: string;
  code?: string;
}

export interface MessageResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationCodeRequest {
  email: string;
}
