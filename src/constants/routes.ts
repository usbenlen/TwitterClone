/** @format */

export const APP_ROUTES = {
  HOME: "/",

  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_RESET_CODE: "/verify-reset-code",
  RESET_PASSWORD: "/reset-password",
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

  forgotPassword: () => "/forgot-password",
  verifyResetCode: () => "/verify-reset-code",
  resetPassword: () => "/reset-password",
} as const;
