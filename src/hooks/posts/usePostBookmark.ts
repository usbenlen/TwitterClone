import { usePostReaction } from "@/hooks/posts/usePostReaction";

import type { Post } from "@/types/post";

export function usePostBookmark(post: Post) {
  const { pending, toggle } = usePostReaction(post, "bookmark");

  return {
    bookmarkedByMe: post.bookmarkedByMe,
    pending,
    toggleBookmark: toggle,
  };
}
