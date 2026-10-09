import { skipToken } from "@reduxjs/toolkit/query/react";
import {
  useGetPostsQuery,
  errorMessage,
  type ProfileTab,
} from "@/store/postsApi";
import { useGetProfileQuery } from "@/store/sharedApi";
import type { Tweet } from "@/types";

export type { ProfileTab } from "@/store/postsApi";
const EMPTY: Tweet[] = [];

export function useProfile(
  username: string | undefined,
  activeTab: ProfileTab,
) {
  const profile = useGetProfileQuery(username ?? skipToken);
  const user = profile.currentData ?? null;
  const query = useGetPostsQuery(
    user
      ? { kind: "profile", username: user.username, tab: activeTab }
      : skipToken,
  );
  const isLoading = Boolean(username) && !user && profile.isFetching;

  return {
    user,
    tweets: query.currentData ?? EMPTY,
    isLoading,
    isTabLoading: query.isFetching && !query.currentData,
    notFound: !username || (!user && !isLoading && Boolean(profile.error)),
    tabError: query.error ? errorMessage(query.error) : null,
  };
}
