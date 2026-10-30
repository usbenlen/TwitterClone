import { usePostReaction } from "@/features/content/hooks/posts/usePostReaction";

import type { Post } from "@/features/content/types";

export function usePostLike(post: Post) {
  const { pending, toggle } = usePostReaction(post, "like");
  return {
    likedByMe: post.likedByMe,
    likesCount: post.likesCount,
    pending,
    toggleLike: toggle,
  };
}
