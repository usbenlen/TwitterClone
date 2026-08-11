import { useState } from "react";

import { tweetApi } from "@/api/tweet.api";

import type { Tweet } from "@/types/tweet";

function readBookmarkedState(result: unknown, fallback: boolean): boolean {
  if (!result || typeof result !== "object") return fallback;

  if ("bookmarkedByMe" in result) {
    return Boolean((result as { bookmarkedByMe: unknown }).bookmarkedByMe);
  }

  if ("isBookmarkedByCurrentUser" in result) {
    return Boolean(
      (result as { isBookmarkedByCurrentUser: unknown })
        .isBookmarkedByCurrentUser,
    );
  }

  return fallback;
}

export function useTweetBookmark(tweet: Tweet) {
  const [bookmarkedByMe, setBookmarkedByMe] = useState(tweet.bookmarkedByMe);
  const [pending, setPending] = useState(false);

  const toggleBookmark = async () => {
    if (pending) return;

    const previous = bookmarkedByMe;
    const next = !bookmarkedByMe;

    setBookmarkedByMe(next);
    setPending(true);

    try {
      const result = await tweetApi.toggleBookmark(tweet.id, bookmarkedByMe);
      setBookmarkedByMe(readBookmarkedState(result, next));
    } catch {
      setBookmarkedByMe(previous);
    } finally {
      setPending(false);
    }
  };

  return {
    bookmarkedByMe,
    pending,
    toggleBookmark,
  };
}
