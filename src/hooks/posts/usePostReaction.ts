import { useAppSelector, useAppStore } from "@/store/hooks";
import { postsApi } from "@/store/posts/postQueries";
import { reactionKey, targetOf } from "@/store/posts/postTargets";
import { runReaction } from "@/store/posts/runReaction";

import type { Post, Reaction } from "@/types/post";

export function usePostReaction(
  post: Post,
  action: "like" | "repost" | "bookmark",
) {
  const store = useAppStore();
  const target = targetOf(post);

  const pending = useAppSelector(
    (state) =>
      postsApi.endpoints.react.select(reactionKey({ ...target, action }))(state)
        .isLoading,
  );

  const toggle = () => {
    const active =
      action === "like"
        ? post.likedByMe
        : action === "repost"
          ? post.repostedByMe
          : post.bookmarkedByMe;
    const reaction: Reaction = { ...target, action, active };
    return runReaction(store, reaction);
  };

  return { pending, toggle };
}
