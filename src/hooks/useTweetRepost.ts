import { useState } from "react";

import { tweetApi, commentApi } from "@/api";

import type { Tweet } from "@/types/tweet";

export function useTweetRepost(tweet: Tweet) {
  const [repostedByMe, setRepostedByMe] = useState(tweet.repostedByMe);
  const [repostsCount, setRepostsCount] = useState(tweet.retweetsCount);
  const [pending, setPending] = useState(false);

  const toggleRepost = async () => {
    if (pending) return;

    const previous = { repostedByMe, repostsCount };

    setRepostedByMe(!repostedByMe);
    setRepostsCount((count) => (repostedByMe ? count - 1 : count + 1));

    setPending(true);

    try {
      if (tweet.isComment) {
        const result = await commentApi.toggleRepost(tweet.id, repostedByMe);
        setRepostedByMe(result.repostedByMe);
        setRepostsCount(result.repostsCount);
      } else {
        const result = await tweetApi.toggleRepost(tweet.id, repostedByMe);
        setRepostedByMe(result.repostedByMe);
        setRepostsCount(result.repostsCount);
      }
    } catch {
      setRepostedByMe(previous.repostedByMe);
      setRepostsCount(previous.repostsCount);
    } finally {
      setPending(false);
    }
  };

  return {
    repostedByMe,
    repostsCount,
    pending,
    toggleRepost,
  };
}
