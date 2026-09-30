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
  const user =
    profile.currentData?.username === username ? profile.currentData : null;
  const query = useGetPostsQuery(
    user
      ? { kind: "profile", username: user.username, tab: activeTab }
      : skipToken,
  );
  return {
    user,
    tweets: query.currentData ?? EMPTY,
    isLoading: Boolean(username) && !user && !profile.error,
    isTabLoading: query.isFetching && !query.currentData,
    notFound: !username || Boolean(profile.error),
    tabError: query.error ? errorMessage(query.error) : null,
  };
}
