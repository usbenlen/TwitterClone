/** @format */

import {
  createContext,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import { followApi } from "@/api/follow.api";
import { useAuth } from "@/hooks";
import type { User } from "@/types/user";
import type { FollowUser } from "@/types/follow";

export interface FollowContextValue {
  followers: FollowUser[]; //User[]
  following: FollowUser[]; //User[]

  getFollowers(user: User["id"]): Promise<void>;
  getFollowing(user: User["id"]): Promise<void>;

  followingCount: number;
  followersCount: number;

  // follow(user: User): Promise<void>;
  follow(user: FollowUser): Promise<void>;
  unfollow(user: User["id"]): Promise<void>;
  isFollowing(user: User["id"]): boolean;
  removeFollower(userId: User["id"], followId: User["id"]): Promise<void>;
}

export const FollowContext =
  createContext<FollowContextValue | null>(null);

interface Props {
    children: ReactNode;
}

export function FollowProvider({ children }: Props) {
  
  const [following, setFollowing] = useState<FollowUser[]>(() => { //User[]
    
    const saved = localStorage.getItem("following");


    try {
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error(error);
      return [];
    }

  });

  const [followers, setFollowers] = useState<FollowUser[]>([]); //User[]
  
  const followingCount = following.length;
  const followersCount = followers.length;

  const { user: currentUser } = useAuth();

  useEffect(() => {
    localStorage.setItem(
      "following",
      JSON.stringify(following)
    );
  }, [following]);

  const follow = async (user: FollowUser) => {
    try {
      if (!currentUser) return;
      
      await followApi.follow({
        targetUserId: user.id,
      });


      // добавляем в мои подписки
      setFollowing(prev => {
        if (prev.some(item => item.id === user.id)) {
          return prev;
        }

        return [...prev, user];
      });


      // добавляем меня в followers этого пользователя
      setFollowers(prev => {
        if (prev.some(item => item.id === currentUser?.id)) {
          return prev;
        }

        return [
          ...prev,
          currentUser!
        ];
      });


    } catch(error) {
      console.error(error);
    }
  };

  const unfollow = async (userId: User["id"]) => {
    try {
      await followApi.unfollow({
        targetUserId: userId,
      });

        setFollowing(prev => 
          prev.filter(user => user.id !== userId)
        );
      
    } catch(error) {
      console.error(error);
    }
  };

  const isFollowing = useCallback(
  (userId: User["id"]) => {
    console.log("CHECK:", userId, following);

    return following.some(
      item => item.id === userId
    );
  },
    [following]
  );

  const removeFollower = async (
      userId: User["id"],
      followerId: User["id"]
      ): Promise<void> => {
        try {
          await followApi.removeFollower({
            userId,
            followId: followerId,
          });

          setFollowers(prev =>
            prev.filter(
              user => user.id !== followerId
            )
          );

        } catch (error) {
          console.error(error);
        }
    };

  const getFollowers = async (userId: User["id"]) => {
  try {
      const data = await followApi.followers(userId);

      setFollowers(data ?? []);

    } catch (error) {
      console.error(error);
    }
  };

  const getFollowing = async (userId: User["id"]) => {
  try {
    setFollowing(prev => {

      return [
        ...prev,
      ];
    });

  } catch(error) {
    console.error(error);
  }
};
  
  return (
    <FollowContext.Provider
      value={{
        following,
        followingCount,
        followers,
        followersCount,
        follow,
        unfollow,
        isFollowing,
        removeFollower,
        getFollowers,
        getFollowing,
      }}
    >
      {children}
    </FollowContext.Provider>
  );
}

