/** @format */

import type {
  AuthResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  ResetPasswordRequest,
  RegisterRequest,
  VerifyResetCodeRequest,
  VerifyEmailRequest,
  ResendVerificationCodeRequest,
} from "@/types/auth";
import type { User } from "@/types/user";
import { currentUser } from "@/mock/data/users";

import { delay } from "@/mock/utils/delay";

let pendingPasswordChange = false;

export const mockAuthApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    await delay();
    void data;

    return {
      userId: currentUser.id,
      username: currentUser.username,
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      accessTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  },

  async register(data: RegisterRequest): Promise<MessageResponse> {
    await delay();
    void data;

    return {
      message: "Код підтвердження надіслано на вашу електронну пошту.",
    };
  },

  async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
    await delay();

    if (!data.code || data.code.trim().length === 0) {
      throw new Error("Код підтвердження обов'язковий.");
    }

    return {
      userId: currentUser.id,
      username: data.email.split("@")[0],
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      accessTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  },

  async resendVerificationCode(
    data: ResendVerificationCodeRequest,
  ): Promise<MessageResponse> {
    await delay();
    void data;

    return {
      message: "Новий код підтвердження надіслано на вашу електронну пошту.",
    };
  },

  async logout(): Promise<void> {
    await delay(150);
  },

  async me(): Promise<User> {
    await delay(200);
    return currentUser;
  },

  async forgotPassword(_data: ForgotPasswordRequest): Promise<MessageResponse> {
    await delay(150);
    void _data;
    return {
      message: "If the email exists, a reset code has been sent.",
    };
  },

  async verifyResetCode(
    _data: VerifyResetCodeRequest,
  ): Promise<MessageResponse> {
    await delay(150);
    void _data;
    return {
      message: "Reset code is valid.",
    };
  },

  async resetPassword(_data: ResetPasswordRequest): Promise<MessageResponse> {
    await delay(150);
    void _data;
    return {
      message: "Password reset successfully.",
    };
  },

  changePassword: async (
    data: ChangePasswordRequest,
  ): Promise<MessageResponse> => {
    await delay(300);

    if (data.code) {
      if (!pendingPasswordChange) {
        throw new Error("There is no pending password change request.");
      }

      if (!data.code.trim()) {
        throw new Error("Confirmation code is invalid or expired.");
      }

      pendingPasswordChange = false;

      return {
        message: "Password changed successfully.",
      };
    }

    pendingPasswordChange = true;

    return {
      message: "Password change confirmation code has been sent to your email.",
    };
  },
};
