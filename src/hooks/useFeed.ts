import { useGetPostsQuery, errorMessage } from "@/store/postsApi";
import type { Tweet } from "@/types";
const EMPTY: Tweet[] = [];

export function useFeed() {
  const query = useGetPostsQuery({ kind: "feed" });
  return {
    tweets: query.data ?? EMPTY,
    isLoading: query.isLoading,
    error: query.error ? errorMessage(query.error) : null,
    reload: query.refetch,
  };
}
