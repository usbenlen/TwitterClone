import { useCallback, useEffect, useState } from "react";

import { tweetApi } from "@/api/tweet.api";

import type { Tweet } from "@/types/tweet";
import {
  markQuotedTargetEditedInTweets,
  markQuotedTargetUnavailableInTweets,
} from "@/utils/quotes";

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
    const handleCommentUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ comment: Tweet }>;
      setTweets((previous) =>
        markQuotedTargetEditedInTweets(
          previous,
          "comment",
          customEvent.detail.comment.id,
        ),
      );
    };

    const handleCommentDeleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ commentId: string }>;
      setTweets((previous) =>
        markQuotedTargetUnavailableInTweets(
          previous,
          "comment",
          customEvent.detail.commentId,
        ),
      );
    };

    window.addEventListener("comment-updated", handleCommentUpdated);
    window.addEventListener("comment-deleted", handleCommentDeleted);
    return () => {
      window.removeEventListener("comment-updated", handleCommentUpdated);
      window.removeEventListener("comment-deleted", handleCommentDeleted);
    };
  }, []);

  useEffect(() => {
    const handleTweetCreated = (e: Event) => {
      const customEvent = e as CustomEvent<{ tweet: Tweet }>;
      setTweets((previous) => {
        if (previous.some((item) => item.id === customEvent.detail.tweet.id))
          return previous;

        return [customEvent.detail.tweet, ...previous];
      });
    };

    window.addEventListener("tweet-created", handleTweetCreated);
    return () => {
      window.removeEventListener("tweet-created", handleTweetCreated);
    };
  }, []);

  useEffect(() => {
    const handleTweetDeleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ tweetId: string }>;
      setTweets((previous) =>
        markQuotedTargetUnavailableInTweets(
          previous.filter((tweet) => tweet.id !== customEvent.detail.tweetId),
          "post",
          customEvent.detail.tweetId,
        ),
      );
    };

    window.addEventListener("tweet-deleted", handleTweetDeleted);
    return () => {
      window.removeEventListener("tweet-deleted", handleTweetDeleted);
    };
  }, []);

  useEffect(() => {
    const handleTweetUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ tweet: Tweet }>;
      setTweets((previous) =>
        markQuotedTargetEditedInTweets(
          previous.map((tweet) =>
            tweet.id === customEvent.detail.tweet.id
              ? customEvent.detail.tweet
              : tweet,
          ),
          "post",
          customEvent.detail.tweet.id,
        ),
      );
    };

    window.addEventListener("tweet-updated", handleTweetUpdated);
    return () => {
      window.removeEventListener("tweet-updated", handleTweetUpdated);
    };
  }, []);

  const prepend = useCallback((tweet: Tweet) => {
    setTweets((prev) => [tweet, ...prev]);
  }, []);

  return { tweets, isLoading, error, reload: load, prepend };
}
