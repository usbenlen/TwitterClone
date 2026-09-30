import { useTweetReaction } from "./useTweetReaction";
import type { Tweet } from "@/types";

export function useTweetBookmark(tweet: Tweet) {
  const { pending, toggle } = useTweetReaction(tweet, "bookmark");
  return {
    bookmarkedByMe: tweet.bookmarkedByMe,
    pending,
    toggleBookmark: toggle,
  };
}
