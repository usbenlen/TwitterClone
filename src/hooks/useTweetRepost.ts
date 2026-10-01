import { useTweetReaction } from "@/hooks/useTweetReaction";
import type { Tweet } from "@/types";

export function useTweetRepost(tweet: Tweet) {
  const { pending, toggle } = useTweetReaction(tweet, "repost");
  return {
    repostedByMe: tweet.repostedByMe,
    repostsCount: tweet.retweetsCount,
    pending,
    toggleRepost: toggle,
    ensureReposted: () =>
      tweet.repostedByMe ? Promise.resolve(true) : toggle(),
  };
}
