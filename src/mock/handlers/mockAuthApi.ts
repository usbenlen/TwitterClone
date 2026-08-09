/** @format */

import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";
import type { User } from "@/types/user";
import { currentUser } from "@/mock/data/users";

import { delay } from "@/mock/utils/delay";

export const mockAuthApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    await delay();

    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        ...currentUser,
        email: data.email,
      },
    };
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    await delay();

    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        ...currentUser,
        username: data.username,
        displayName: data.displayName,
        email: data.email,
        followersCount: 0,
        followingCount: 0,
      },
    };
  },

  async logout(): Promise<void> {
    await delay(150);
  },

  async me(): Promise<User> {
    await delay(200);
    return currentUser;
  },

  async forgotPassword(_email: string): Promise<void> {
    await delay(150);
  },

  async verifyResetCode(_email: string, _code: string): Promise<void> {
    await delay(150);
  },

  async resetPassword(
    _email: string,
    _code: string,
    _password: string,
  ): Promise<void> {
    await delay(150);
  },
};
