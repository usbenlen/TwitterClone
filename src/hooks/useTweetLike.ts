import { useTweetReaction } from "./useTweetReaction";
import type { Tweet } from "@/types";

export function useTweetLike(tweet: Tweet) {
  const { pending, toggle } = useTweetReaction(tweet, "like");
  return {
    likedByMe: tweet.likedByMe,
    likesCount: tweet.likesCount,
    pending,
    toggleLike: toggle,
  };
}
