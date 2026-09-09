import { useEffect, useState } from "react";

import { userApi } from "@/api";

import type { User, Tweet } from "@/types";

export type ProfileTab = "posts" | "replies" | "likes" | "reposts";

const EMPTY_TABS: Record<ProfileTab, Tweet[]> = {
  posts: [],
  replies: [],
  likes: [],
  reposts: [],
};

const EMPTY_LOADED_TABS: Record<ProfileTab, boolean> = {
  posts: false,
  replies: false,
  likes: false,
  reposts: false,
};

async function loadProfileTab(user: User, tab: ProfileTab): Promise<Tweet[]> {
  switch (tab) {
    case "replies":
      return userApi.getReplies(user.username);
    case "likes":
      return userApi.getLikes(user.username);
    case "reposts":
      return userApi.getReposts(user.username);
    case "posts":
    default:
      return userApi.getPosts(user.username);
  }
}

export function useProfile(
  username: string | undefined,
  activeTab: ProfileTab,
) {
  const [user, setUser] = useState<User | null>(null);
  const [tabTweets, setTabTweets] =
    useState<Record<ProfileTab, Tweet[]>>(EMPTY_TABS);
  const [loadedTabs, setLoadedTabs] =
    useState<Record<ProfileTab, boolean>>(EMPTY_LOADED_TABS);
  const [isLoading, setIsLoading] = useState(true);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [tabError, setTabError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(null);
      setTabTweets(EMPTY_TABS);
      setLoadedTabs(EMPTY_LOADED_TABS);
      setIsLoading(false);
      setIsTabLoading(false);
      setNotFound(false);
      setTabError(null);
      return;
    }

    const currentUsername = username;

    let active = true;

    setIsLoading(true);
    setUser(null);
    setTabTweets(EMPTY_TABS);
    setLoadedTabs(EMPTY_LOADED_TABS);
    setIsTabLoading(false);
    setNotFound(false);
    setTabError(null);

    async function load() {
      try {
        const profile = await userApi.getByUsername(currentUsername);

        if (!active) return;

        setUser(profile);
      } catch {
        if (active) {
          setNotFound(true);
          setUser(null);
          setTabTweets(EMPTY_TABS);
          setLoadedTabs(EMPTY_LOADED_TABS);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [username]);

  useEffect(() => {
    if (!user || loadedTabs[activeTab]) return;

    let active = true;
    const currentUser = user;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsTabLoading(true);
    setTabError(null);

    async function loadCurrentTab() {
      try {
        const tweets = await loadProfileTab(currentUser, activeTab);

        if (!active) return;

        setTabTweets((current) => ({
          ...current,
          [activeTab]: tweets,
        }));
        setLoadedTabs((current) => ({
          ...current,
          [activeTab]: true,
        }));
      } catch {
        if (!active) return;

        setTabError("Не вдалося завантажити пости для цієї вкладки.");
        setTabTweets((current) => ({
          ...current,
          [activeTab]: [],
        }));
      } finally {
        if (active) setIsTabLoading(false);
      }
    }

    void loadCurrentTab();

    return () => {
      active = false;
    };
  }, [user, activeTab, loadedTabs]);

  useEffect(() => {
    const handleTweetUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ tweet: Tweet }>;
      const updatedTweet = customEvent.detail.tweet;

      setTabTweets((current) => {
        const next = { ...current };
        (Object.keys(next) as ProfileTab[]).forEach((tab) => {
          next[tab] = next[tab].map((t) =>
            t.id === updatedTweet.id ? updatedTweet : t,
          );
        });
        return next;
      });
    };

    window.addEventListener("tweet-updated", handleTweetUpdated);
    return () => {
      window.removeEventListener("tweet-updated", handleTweetUpdated);
    };
  }, []);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return {
    user,
    tweets: tabTweets[activeTab],
    isLoading,
    isTabLoading,
    notFound,
    tabError,
    updateUser,
  };
}
