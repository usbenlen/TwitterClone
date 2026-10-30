import { useGetPostsQuery } from "@/store/posts/postQueries";
import { errorMessage } from "@/store/appApi";

import type { Post } from "@/types/post";

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
