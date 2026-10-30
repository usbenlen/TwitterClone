import { skipToken } from "@reduxjs/toolkit/query/react";

import { useGetPostsQuery } from "@/store/posts/postQueries";
import { errorMessage } from "@/store/appApi";
import { useGetProfileQuery } from "@/store/profileQueries";

import type { Post, ProfileTab } from "@/types/post";

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
