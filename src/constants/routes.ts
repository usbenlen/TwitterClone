import type { SearchCriteria } from "@/types";
import { DEFAULT_SEARCH_CRITERIA, serializeSearchCriteria } from "@/utils/search";

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
  FOLLOW_RECOMMENDATIONS: "/follow",

  POST: "/post/:postId",

  PROFILE: "/:username",
  FOLLOWING: "/:username/following",
  FOLLOWERS: "/:username/followers",

  SETTINGS: "/settings",
  SETTINGS_THEME: "/settings/theme",
  SETTINGS_CHANGE_PASSWORD: "/settings/change-password",
  SETTINGS_CHANGE_PASSWORD_RESET: "/settings/change-password/reset",

  NOT_FOUND: "*",

  profile: (username: string) => `/${username}`,

  following: (username: string) => `/${username}/following`,
  followers: (username: string) => `/${username}/followers`,

  followRecommendations: (tab: "people" | "creators" = "people") => `/follow?tab=${tab}`,

  post: (postId: string) => `/post/${postId}`,

  search: (criteria: Partial<SearchCriteria> = {}) => `/search?${serializeSearchCriteria({ ...DEFAULT_SEARCH_CRITERIA, ...criteria })}`,

  forgotPassword: () => "/forgot-password",
  verifyResetCode: () => "/verify-reset-code",
  resetPassword: () => "/reset-password",
} as const;
