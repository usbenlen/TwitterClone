/** @format */

export const MOCK_ENABLED = import.meta.env.VITE_USE_MOCK === "true";

export { mockAuthApi } from "@/mock/handlers/mockAuthApi";

export { mockTweetApi } from "@/mock/handlers/mockTweetApi";

export { mockUserApi } from "@/mock/handlers/mockUserApi";

export { mockMediaApi } from "@/mock/handlers/mockMediaApi";
