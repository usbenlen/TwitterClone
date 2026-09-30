import { useCallback, useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sharedApi } from "@/store/sharedApi";
import type { UserShort } from "@/types";

const EMPTY: UserShort[] = [];

export function useFollow() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const followingSelector = useMemo(
    () => sharedApi.endpoints.getFollowing.select(currentUser?.id ?? skipToken),
    [currentUser?.id],
  );
  const followersSelector = useMemo(
    () => sharedApi.endpoints.getFollowers.select(currentUser?.id ?? skipToken),
    [currentUser?.id],
  );
  const following = useAppSelector(
    (state) => followingSelector(state).data ?? EMPTY,
  );
  const followers = useAppSelector(
    (state) => followersSelector(state).data ?? EMPTY,
  );

  const follow = useCallback(
    async (user: UserShort) => {
      if (!currentUser || currentUser.id === user.id) return;
      await dispatch(
        sharedApi.endpoints.followUser.initiate({
          viewerId: currentUser.id,
          user,
        }),
      ).unwrap();
    },
    [currentUser, dispatch],
  );

  const unfollow = useCallback(
    async (user: UserShort) => {
      if (!currentUser || currentUser.id === user.id) return;
      await dispatch(
        sharedApi.endpoints.unfollowUser.initiate({
          viewerId: currentUser.id,
          user,
        }),
      ).unwrap();
    },
    [currentUser, dispatch],
  );

  const removeFollower = useCallback(
    async (follower: UserShort) => {
      if (!currentUser) return;
      await dispatch(
        sharedApi.endpoints.removeFollower.initiate({
          user: currentUser,
          follower,
        }),
      ).unwrap();
    },
    [currentUser, dispatch],
  );

  const isFollowing = useCallback(
    (userId: string) => following.some((user) => user.id === userId),
    [following],
  );

  return {
    following,
    followers,
    followingCount: following.length,
    followersCount: followers.length,
    follow,
    unfollow,
    removeFollower,
    isFollowing,
  };
}
