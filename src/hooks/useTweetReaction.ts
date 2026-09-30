import { useAppSelector, useAppStore } from "@/store/hooks";
import {
  postsApi,
  reactionKey,
  targetOf,
  type Reaction,
} from "@/store/postsApi";
import { runReaction } from "@/store/reactions";
import type { Tweet } from "@/types";

export function useTweetReaction(
  tweet: Tweet,
  action: "like" | "repost" | "bookmark",
) {
  const store = useAppStore();
  const target = targetOf(tweet);
  const pending = useAppSelector(
    (state) =>
      postsApi.endpoints.react.select(reactionKey({ ...target, action }))(state)
        .isLoading,
  );
  const toggle = () => {
    const active =
      action === "like"
        ? tweet.likedByMe
        : action === "repost"
          ? tweet.repostedByMe
          : tweet.bookmarkedByMe;
    const reaction: Reaction = { ...target, action, active };
    return runReaction(store, reaction);
  };
  return { pending, toggle };
}
