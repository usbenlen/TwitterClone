/** @format */
import { useEffect, useState } from "react";

import { userApi, tweetApi } from "@/api";

import type { User, Tweet } from "@/types";

export function useProfile(username: string | undefined) {
  const [user, setUser] = useState<User | null>(null);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    let active = true;
    setIsLoading(true);
    setNotFound(false);

    async function load() {
      try {
        const [profile, userTweets] = await Promise.all([
          userApi.getByUsername(username!),
          tweetApi.getByUsername(username!),
        ]);
        if (!active) return;
        setUser(profile);
        setTweets(userTweets);
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [username]);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return { user, tweets, isLoading, notFound, updateUser };
}
