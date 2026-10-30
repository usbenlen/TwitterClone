import { STORAGE_KEYS } from "@/shared/constants/storage";

let version = 0;

// Обгортка над localStorage для роботи з токенами
export const tokenStorage = {
  getVersion: (): number => version,

  getAccessToken: (): string | null =>
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),

  getRefreshToken: (): string | null =>
    localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),

  setTokens: (accessToken: string, refreshToken: string): void => {
    version += 1;
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  setAccessToken: (accessToken: string): void => {
    version += 1;
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  },

  setRefreshToken: (refreshToken: string): void => {
    version += 1;
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  hasTokens: (): boolean => {
    return Boolean(
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) &&
      localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
    );
  },

  clear: (): void => {
    version += 1;
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
};
