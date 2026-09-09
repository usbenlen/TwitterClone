import { useCallback, useEffect, useState } from "react";

import { tweetApi } from "@/api";

import type { Tweet } from "@/types/tweet";

export function useBookmarks() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const bookmarkedTweets = await tweetApi.getBookmarked();
      setTweets(bookmarkedTweets);
    } catch {
      setError("Не вдалося завантажити закладки.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    const handleBookmarkToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{
        tweetId: string;
        bookmarked: boolean;
      }>;
      if (!customEvent.detail.bookmarked) {
        setTweets((prev) =>
          prev.filter((t) => t.id !== customEvent.detail.tweetId),
        );
      }
    };

    window.addEventListener("tweet-bookmark-toggled", handleBookmarkToggle);

    const handleTweetDeleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ tweetId: string }>;
      setTweets((prev) =>
        prev.filter((t) => t.id !== customEvent.detail.tweetId),
      );
    };

    window.addEventListener("tweet-deleted", handleTweetDeleted);

    const handleTweetUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ tweet: Tweet }>;
      setTweets((prev) =>
        prev.map((t) =>
          t.id === customEvent.detail.tweet.id ? customEvent.detail.tweet : t,
        ),
      );
    };

    window.addEventListener("tweet-updated", handleTweetUpdated);

    return () => {
      window.removeEventListener(
        "tweet-bookmark-toggled",
        handleBookmarkToggle,
      );
      window.removeEventListener("tweet-deleted", handleTweetDeleted);
      window.removeEventListener("tweet-updated", handleTweetUpdated);
    };
  }, []);

  return { tweets, isLoading, error, reload: load };
}
