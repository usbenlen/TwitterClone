import { skipToken } from "@reduxjs/toolkit/query/react";

import { useGetPostsQuery } from "@/features/content/api/postQueries";
import { useGetProfileQuery } from "@/features/profiles/api/profileQueries";
import { errorMessage } from "@/shared/store/appApi";

import type { Post, ProfileTab } from "@/features/content/types";

const EMPTY: Post[] = [];

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
    posts: query.currentData ?? EMPTY,
    isLoading,
    isTabLoading: query.isFetching && !query.currentData,
    notFound: !username || (!user && !isLoading && Boolean(profile.error)),
    tabError: query.error ? errorMessage(query.error) : null,
  };
}
