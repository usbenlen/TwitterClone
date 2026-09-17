import { useEffect, useState } from "react";

import { searchApi } from "@/api";

import { SEARCH_DEBOUNCE_MS } from "@/constants/app";
import { useAuth } from "@/hooks/useAuth";
import { useFollow } from "@/hooks/useFollow";
import { hasActiveSearchCriteria } from "@/utils/search";

import type { SearchCriteria, Tweet, UserShort } from "@/types";

export function useSearch(criteria: SearchCriteria) {
  const { user } = useAuth();
  const { following } = useFollow();
  const [users, setUsers] = useState<UserShort[]>([]);
  const [posts, setPosts] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasActiveSearchCriteria(criteria)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsers([]);
      setPosts([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let active = true;

    const timer = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);

        const viewer = {
          followingIds: following.map((followedUser) => followedUser.id),
          location: user?.location,
        };

        const [userResults, postResults] = await Promise.all([
          searchApi.users(criteria, viewer),
          searchApi.posts(criteria, viewer),
        ]);

        if (!active) return;

        setUsers(userResults);
        setPosts(postResults);
      } catch (error) {
        if (!active) return;

        setUsers([]);
        setPosts([]);

        setError(
          error instanceof Error ? error.message : "Не вдалося виконати пошук.",
        );
      } finally {
        if (active) setIsLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [criteria, following, user?.location]);

  useEffect(() => {
    const handleTweetDeleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ tweetId: string }>;
      setPosts((prev) =>
        prev.filter((t) => t.id !== customEvent.detail.tweetId),
      );
    };

    window.addEventListener("tweet-deleted", handleTweetDeleted);
    return () => {
      window.removeEventListener("tweet-deleted", handleTweetDeleted);
    };
  }, []);

  return {
    users,
    posts,
    isLoading,
    error,
  };
}
