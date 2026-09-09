import { useState } from "react";

import { tweetApi, commentApi } from "@/api";

import type { Tweet } from "@/types/tweet";

export function useTweetLike(tweet: Tweet) {
  const [likedByMe, setLikedByMe] = useState(tweet.likedByMe);
  const [likesCount, setLikesCount] = useState(tweet.likesCount);
  const [pending, setPending] = useState(false);

  const toggleLike = async () => {
    if (pending) return;

    const previous = { likedByMe, likesCount };

    setLikedByMe(!likedByMe);
    setLikesCount((count) => (likedByMe ? count - 1 : count + 1));

    setPending(true);

    try {
      if (tweet.isComment) {
        const result = await commentApi.toggleLike(tweet.id, likedByMe);
        setLikedByMe(result.likedByMe);
        setLikesCount(result.likesCount);
      } else {
        const result = await tweetApi.toggleLike(tweet.id, likedByMe);
        setLikedByMe(result.likedByMe);
        setLikesCount(result.likesCount);
      }
    } catch {
      setLikedByMe(previous.likedByMe);
      setLikesCount(previous.likesCount);
    } finally {
      setPending(false);
    }
  };

  return {
    likedByMe,
    likesCount,
    pending,
    toggleLike,
  };
}
