import { usePostReaction } from "@/hooks/posts/usePostReaction";

import type { Post } from "@/types/post";

export function usePostLike(post: Post) {
  const { pending, toggle } = usePostReaction(post, "like");
  return {
    likedByMe: post.likedByMe,
    likesCount: post.likesCount,
    pending,
    toggleLike: toggle,
  };
}
