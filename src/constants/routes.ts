/** @format */

export const APP_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/:username",
  SETTINGS: "/settings",
  NOT_FOUND: "*",

  profile: (username: string) => `/${username}`,
} as const;
