import { postsApi } from "@/features/content/api/postQueries";
import { reactionKey, targetOf } from "@/features/content/model/postTargets";
import { runReaction } from "@/features/content/model/runReaction";
import { useAppSelector, useAppStore } from "@/shared/store/hooks";

import type { Post, Reaction } from "@/features/content/types";

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
