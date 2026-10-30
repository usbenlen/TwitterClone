import { useGetPostsQuery } from "@/features/content/api/postQueries";
import { errorMessage } from "@/shared/store/appApi";

import type { Post } from "@/features/content/types";

const EMPTY: Post[] = [];

export function useBookmarks() {
  const query = useGetPostsQuery({ kind: "bookmarks" });

  return {
    posts: query.data?.filter((post) => post.bookmarkedByMe) ?? EMPTY,
    isLoading: query.isLoading,
    error: query.error ? errorMessage(query.error) : null,
    reload: query.refetch,
  };
}
