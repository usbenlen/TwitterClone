/** @format */

/**
 * Формує базову адресу до API з .env змінних.
 * VITE_PATH_TO_SERVER + VITE_PATH_TO_API, напр:
 *   https://localhost:7001/ + api/  =>  https://localhost:7001/api/
 */

function buildApiBaseUrl(): string {
  const server = import.meta.env.VITE_PATH_TO_SERVER ?? "";
  const apiPath = import.meta.env.VITE_PATH_TO_API ?? "";
  // Прибирання подвійних слешів на стику
  return `${server.replace(/\/+$/, "")}/${apiPath.replace(/^\/+/, "")}`.replace(
    /\/+$/,
    "/",
  );
}

export const API_BASE_URL = buildApiBaseUrl();

// Ендпоінти API. Тут зібрано всі шляхи, щоб не дублювати рядки
export const ENDPOINTS = {
  auth: {
    login: "auth/login",
    register: "auth/register",
    refresh: "auth/refresh",
    logout: "auth/logout",
    me: "auth/me",
  },
  users: {
    byUsername: (username: string) => `users/${username}`,
  },
  tweets: {
    feed: "tweets/feed",
    create: "tweets",
    byUsername: (username: string) => `tweets/user/${username}`,
    like: (id: string) => `tweets/${id}/like`,
  },
  follows: {
    follow: (userId: string) => `follows/${userId}`,
    unfollow: (userId: string) => `follows/${userId}`,
    followers: (userId: string) => `follows/${userId}/followers`,
    following: (userId: string) => `follows/${userId}/following`,
    removeFollower: (userId: string, followId: string) => `/follows/${userId}/followers/${followId}`,
  }
} as const;
