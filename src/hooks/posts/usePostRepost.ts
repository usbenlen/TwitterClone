import { usePostReaction } from "@/hooks/posts/usePostReaction";

import type { Post } from "@/types/post";

export function usePostRepost(post: Post) {
  const { pending, toggle } = usePostReaction(post, "repost");

  return {
    repostedByMe: post.repostedByMe,
    repostsCount: post.retweetsCount,
    pending,
    toggleRepost: toggle,
    ensureReposted: () =>
      post.repostedByMe ? Promise.resolve(true) : toggle(),
  };
}
