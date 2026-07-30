/** @format */

import { STORAGE_KEYS } from "@/constants/storage";

// Обгортка над localStorage для роботи з токенами
export const tokenStorage = {
  getAccessToken: (): string | null =>
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),

  getRefreshToken: (): string | null =>
    localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  setAccessToken: (accessToken: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  },

  setRefreshToken: (refreshToken: string): void => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  hasTokens: (): boolean => {
    return Boolean(
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) &&
      localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
    );
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
};
