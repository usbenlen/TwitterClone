/** @format */

export const APP_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/:username",
  SETTINGS: "/settings",
  FOLLOWING: "/:username/following",
  FOLLOWERS: "/:username/followers",
  NOT_FOUND: "*",

  profile: (username: string) => `/${username}`,
  following: (username: string) => `/${username}/following`,
  followers: (username: string) => `/${username}/followers`,
} as const;
