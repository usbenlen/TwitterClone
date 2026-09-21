export const APP_ROUTES = {
  HOME: "/",

  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_RESET_CODE: "/verify-reset-code",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  SEARCH: "/search",
  BOOKMARKS: "/bookmarks",

  POST: "/post/:postId",

  PROFILE: "/:username",
  FOLLOWING: "/:username/following",
  FOLLOWERS: "/:username/followers",

  SETTINGS: "/settings",
  SETTINGS_THEME: "/settings/theme",
  SETTINGS_CHANGE_PASSWORD: "/settings/change-password",
  SETTINGS_CHANGE_PASSWORD_RESET: "/settings/change-password/reset",

  ADMIN: "/admin",
  MODERATION: "/admin/moderation",
  USERS: "/admin/users",
  ADMIN_SETTINGS: "/admin/settings",

  INFO_REPORT: "/admin/moderation/:reportId",
  INFO_USER: "/admin/users/:userId",

  post: (postId: string) => `/post/${postId}`,

  NOT_FOUND: "*",

  profile: (username: string) => `/${username}`,
  admin_user: (username: string) => `/admin/user/${username}`,

  following: (username: string) => `/${username}/following`,
  followers: (username: string) => `/${username}/followers`,

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
