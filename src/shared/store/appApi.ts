import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

import { ApiError } from "@/shared/api";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";

import type { QueryError } from "@/shared/types";

export function errorMessage(
  error: unknown,
  fallback = "Не вдалося виконати запит.",
): string {
  return error && typeof error === "object" && "message" in error
    ? String(error.message)
    : fallback;
}

export async function request<T>(
  run: () => Promise<T>,
): Promise<{ data: T } | { error: QueryError }> {
  try {
    const data = await run();

    return { data: MOCK_ENABLED ? structuredClone(data) : data };
  } catch (error) {
    return {
      error: {
        message: errorMessage(error),
        ...(error instanceof ApiError
          ? { status: error.status, retryAfter: error.retryAfter }
          : {}),
      },
    };
  }
}

export const appApi = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery<QueryError>(),
  tagTypes: [
    "AdminUser",
    "Report",
    "Dashboard",
    "Post",
    "Poll",
    "List",
    "History",
    "Profile",
    "Following",
    "Followers",
    "Scheduled",
    "Recommendation",
    "Notification",
    "NotificationPreferences",
  ],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({}),
});
