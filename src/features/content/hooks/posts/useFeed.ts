import { useGetPostsQuery } from "@/features/content/api/postQueries";
import { errorMessage } from "@/shared/store/appApi";

import type { Post } from "@/features/content/types";

const EMPTY: Post[] = [];

export function useFeed() {
  const query = useGetPostsQuery({ kind: "feed" });

  return {
    posts: query.data ?? EMPTY,
    isLoading: query.isLoading,
    error: query.error ? errorMessage(query.error) : null,
    reload: query.refetch,
  };
}
