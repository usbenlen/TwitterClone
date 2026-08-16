import { useCallback, useEffect, useState } from "react";

import { tweetApi } from "@/api/tweet.api";

import type { Tweet } from "@/types/tweet";

// Завантаження та локальне керування стрічкою твітів
export function useFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tweetApi.getFeed();
      setTweets(data);
    } catch {
      setError("Не вдалося завантажити стрічку.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    const handleTweetDeleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ tweetId: string }>;
      setTweets((prev) =>
        prev.filter((t) => t.id !== customEvent.detail.tweetId),
      );
    };

    window.addEventListener("tweet-deleted", handleTweetDeleted);
    return () => {
      window.removeEventListener("tweet-deleted", handleTweetDeleted);
    };
  }, []);

  const prepend = useCallback((tweet: Tweet) => {
    setTweets((prev) => [tweet, ...prev]);
  }, []);

  return { tweets, isLoading, error, reload: load, prepend };
}
