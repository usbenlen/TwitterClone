/** @format */

import {
  createContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import { subscribeApi } from "@/api/subscribe.api";
import type { User } from "@/types/user";

export interface SubscribeContextValue {
  subscriptions: string[];
  followersCount: number;
  followingCount: number;

  subscribe(username: string): Promise<void>;
  unsubscribe(username: string): Promise<void>;
  isFollowing(username: string): boolean;
}

export const SubscribeContext =
  createContext<SubscribeContextValue | null>(null);


interface Props {
    children: ReactNode;
    isOwnProfile: boolean;
}

export function SubscribeProvider({ children, isOwnProfile }: Props) {
  const [subscriptions, setSubscriptions] = useState<string[]>(() => {
  const saved = localStorage.getItem("subscriptions");

  return saved
    ? JSON.parse(saved)
    : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "subscriptions",
      JSON.stringify(subscriptions)
    );
    localStorage.setItem(
      "followingCount",
      String(followingCount)
    );
  }, [subscriptions]);
  
  const [, setFollowersCount] = useState(0);
  const followersCount = subscriptions.length;

  const [, setFollowingCount] = useState(0);
  const followingCount = subscriptions.length;

  const subscribe = async (username:string) => {
    await subscribeApi.subscribe({
      targetUserId: username
    });

    setSubscriptions(prev => [
      ...prev,
      username,
    ]);

    if (isOwnProfile) {
      setFollowingCount(prev => prev + 1);
    }
  };

  const unsubscribe = async (username:string) => {
      await subscribeApi.unsubscribe({
        targetUserId: username
      });

      setSubscriptions(prev =>
        prev.filter(item => item !== username)
      );
    
      if (isOwnProfile) {
        setFollowingCount(prev => Math.max(0, prev - 1)
      );
    }
  };
    
  const isFollowing = useCallback(
    (username: string) => {
      return subscriptions.includes(username);
    },
    [subscriptions]
  );

  return (
    <SubscribeContext.Provider
      value={{
        subscriptions,
        followersCount,
        followingCount,
        subscribe,
        unsubscribe,
        isFollowing,
      }}
    >
      {children}
    </SubscribeContext.Provider>
  );
}