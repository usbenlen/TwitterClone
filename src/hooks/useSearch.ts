import { useEffect, useState } from "react";

import { searchApi } from "@/api";

import { SEARCH_DEBOUNCE_MS } from "@/constants/app";

import type { Tweet, UserShort } from "@/types";

export function useSearch(query: string) {
  const [users, setUsers] = useState<UserShort[]>([]);
  const [posts, setPosts] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const value = query.trim();

    if (!value) {
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

        const [userResults, postResults] = await Promise.all([
          searchApi.users(value),
          searchApi.posts(value),
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
  }, [query]);

  return {
    users,
    posts,
    isLoading,
    error,
  };
}
