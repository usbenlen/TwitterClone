/** @format */

export const APP_ROUTES = {
  HOME: "/",

  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_RESET_CODE: "/verify-reset-code",
  RESET_PASSWORD: "/reset-password",
  SEARCH: "/search",
  BOOKMARKS: "/bookmarks",

  POST: "/post/:postId",

  PROFILE: "/:username",
  FOLLOWING: "/:username/following",
  FOLLOWERS: "/:username/followers",

  SETTINGS: "/settings",
  SETTINGS_THEME: "/settings/theme",
  SETTINGS_CHANGE_PASSWORD: "/settings/change-password",

  NOT_FOUND: "*",

  profile: (username: string) => `/${username}`,

  following: (username: string) => `/${username}/following`,
  followers: (username: string) => `/${username}/followers`,

  post: (postId: string) => `/post/${postId}`,

  search: (query = "", type: "posts" | "users" = "posts") => {
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    params.set("type", type);

    return `/search?${params.toString()}`;
  },

  forgotPassword: () => "/forgot-password",
  verifyResetCode: () => "/verify-reset-code",
  resetPassword: () => "/reset-password",
} as const;
