import { useGetPostsQuery, errorMessage } from "@/store/postsApi";
import type { Tweet } from "@/types/index";
const EMPTY: Tweet[] = [];

export function useBookmarks() {
  const query = useGetPostsQuery({ kind: "bookmarks" });
  return {
    tweets: query.data?.filter((tweet) => tweet.bookmarkedByMe) ?? EMPTY,
    isLoading: query.isLoading,
    error: query.error ? errorMessage(query.error) : null,
    reload: query.refetch,
  };
}
