export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export type GoogleAuthMode = "signin" | "signup" | "link";

export interface GoogleRedirectContext {
  state: string;
  nonce: string;
  mode: GoogleAuthMode;
  createdAt: number;
  userId: string | null;
  returnTo: string;
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

export interface StartPasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ConfirmPasswordChangeRequest {
  code: string;
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

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt?: string;
}
