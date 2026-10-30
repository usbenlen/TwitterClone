import { useGetPostsQuery } from "@/store/posts/postQueries";
import { errorMessage } from "@/store/appApi";

import type { Post } from "@/types/post";

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
