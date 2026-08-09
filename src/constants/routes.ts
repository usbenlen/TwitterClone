/** @format */

export const APP_ROUTES = {
  HOME: "/",

  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_RESET_CODE: "/verify-reset-code",
  RESET_PASSWORD: "/reset-password",

  PROFILE: "/:username",
  FOLLOWING: "/:username/following",
  FOLLOWERS: "/:username/followers",

  SETTINGS: "/settings",
  NOT_FOUND: "*",

  profile: (username: string) => `/${username}`,
  following: (username: string) => `/${username}/following`,
  followers: (username: string) => `/${username}/followers`,

  forgotPassword: () => "/forgot-password",
  verifyResetCode: () => "/verify-reset-code",
  resetPassword: () => "/reset-password",
} as const;
