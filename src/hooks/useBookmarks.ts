/** @format */
import { useCallback, useEffect, useState } from "react";
import { tweetApi } from "@/api/tweet.api";
import type { Tweet } from "@/types/tweet";

export function useBookmarks() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tweetApi.getBookmarked();
      setTweets(data);
    } catch {
      setError("Не вдалося завантажити закладки.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { tweets, isLoading, error, reload: load };
}
