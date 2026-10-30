import { skipToken } from "@reduxjs/toolkit/query/react";
import { useCallback, useMemo } from "react";

import { followQueries } from "@/features/profiles/api/followQueries";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";

import type { UserShort } from "@/features/profiles/types";

const EMPTY: UserShort[] = [];

export function useFollow() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const followingSelector = useMemo(
    () => followQueries.endpoints.getFollowing.select(currentUser?.id ?? skipToken),
    [currentUser?.id],
  );

  const followersSelector = useMemo(
    () => followQueries.endpoints.getFollowers.select(currentUser?.id ?? skipToken),
    [currentUser?.id],
  );

  const following = useAppSelector(
    (state) => {
      const data = followingSelector(state).data;
      return Array.isArray(data) ? data : EMPTY;
    },
  );

  const followers = useAppSelector(
    (state) => {
      const data = followersSelector(state).data;
      return Array.isArray(data) ? data : EMPTY;
    },
  );

  const follow = useCallback(
    async (user: UserShort) => {
      if (!currentUser || currentUser.id === user.id) return;
      await dispatch(
        followQueries.endpoints.followUser.initiate({
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
        followQueries.endpoints.unfollowUser.initiate({
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
        followQueries.endpoints.removeFollower.initiate({
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
