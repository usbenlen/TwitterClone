import { usePostReaction } from "@/features/content/hooks/posts/usePostReaction";

import type { Post } from "@/features/content/types";

export function usePostBookmark(post: Post) {
  const { pending, toggle } = usePostReaction(post, "bookmark");

  return {
    bookmarkedByMe: post.bookmarkedByMe,
    pending,
    toggleBookmark: toggle,
  };
}
