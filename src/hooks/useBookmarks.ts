import { useCallback, useEffect, useState } from "react";

import { tweetApi, commentApi } from "@/api";

import type { Tweet } from "@/types/tweet";
import {
  markQuotedTargetEditedInTweets,
  markQuotedTargetUnavailableInTweets,
} from "@/utils/quotes";

export function useBookmarks() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [bookmarkedTweets, bookmarkedComments] = await Promise.all([
        tweetApi.getBookmarked(),
        commentApi.getBookmarked(),
      ]);

      const combined = [...bookmarkedTweets, ...bookmarkedComments].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setTweets(combined);
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
        markQuotedTargetUnavailableInTweets(
          prev.filter((t) => t.id !== customEvent.detail.tweetId),
          "post",
          customEvent.detail.tweetId,
        ),
      );
    };

    window.addEventListener("tweet-deleted", handleTweetDeleted);

    const handleTweetUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ tweet: Tweet }>;
      setTweets((prev) =>
        markQuotedTargetEditedInTweets(
          prev.map((t) =>
            t.id === customEvent.detail.tweet.id ? customEvent.detail.tweet : t,
          ),
          "post",
          customEvent.detail.tweet.id,
        ),
      );
    };

    const handleCommentUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ comment: Tweet }>;
      setTweets((prev) =>
        markQuotedTargetEditedInTweets(
          prev.map((item) =>
            item.id === customEvent.detail.comment.id
              ? customEvent.detail.comment
              : item,
          ),
          "comment",
          customEvent.detail.comment.id,
        ),
      );
    };

    const handleCommentDeleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ commentId: string }>;
      setTweets((prev) =>
        markQuotedTargetUnavailableInTweets(
          prev.filter((item) => item.id !== customEvent.detail.commentId),
          "comment",
          customEvent.detail.commentId,
        ),
      );
    };

    window.addEventListener("tweet-updated", handleTweetUpdated);
    window.addEventListener("comment-updated", handleCommentUpdated);
    window.addEventListener("comment-deleted", handleCommentDeleted);

    return () => {
      window.removeEventListener(
        "tweet-bookmark-toggled",
        handleBookmarkToggle,
      );
      window.removeEventListener("tweet-deleted", handleTweetDeleted);
      window.removeEventListener("tweet-updated", handleTweetUpdated);
      window.removeEventListener("comment-updated", handleCommentUpdated);
      window.removeEventListener("comment-deleted", handleCommentDeleted);
    };
  }, []);

  return { tweets, isLoading, error, reload: load };
}
