/** @format */

import type { FollowRequest, UserShort, RemoveFollower } from "@/types";

import { delay } from "@/mock/utils/delay";
import { currentUser, sampleAuthors } from "@/mock/data/users";
import { mockFollowing, mockFollowers } from "@/mock/data/follow";

export const mockFollowApi = {
  async follow({ targetUserId }: FollowRequest): Promise<void> {
    await delay();

    if (targetUserId === currentUser.id) return;

    const targetUser = sampleAuthors.find((user) => user.id === targetUserId);
    if (!targetUser) return;

    if (!mockFollowing[currentUser.id]) mockFollowing[currentUser.id] = [];
    if (!mockFollowers[targetUserId]) mockFollowers[targetUserId] = [];

    const alreadyFollowing = mockFollowing[currentUser.id].some(
      (user) => user.id === targetUserId,
    );
    if (alreadyFollowing) return;

    mockFollowing[currentUser.id].push({
      id: targetUser.id,
      username: targetUser.username,
      displayName: targetUser.displayName ?? targetUser.username,
      avatarUrl: targetUser.avatarUrl ?? undefined,
      isVerified: targetUser.isVerified,
    });

    const alreadyFollower = mockFollowers[targetUserId].some(
      (user) => user.id === currentUser.id,
    );

    if (!alreadyFollower) {
      mockFollowers[targetUserId].push({
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName ?? currentUser.username,
        avatarUrl: currentUser.avatarUrl ?? undefined,
        isVerified: targetUser.isVerified,
      });
    }
  },

  async unfollow({ targetUserId }: FollowRequest): Promise<void> {
    await delay();

    mockFollowing[currentUser.id] = (
      mockFollowing[currentUser.id] ?? []
    ).filter((user) => user.id !== targetUserId);

    mockFollowers[targetUserId] = (mockFollowers[targetUserId] ?? []).filter(
      (user) => user.id !== currentUser.id,
    );
  },

  async following(userId: string): Promise<UserShort[]> {
    await delay();
    return [...(mockFollowing[userId] ?? [])];
  },

  async followers(userId: string): Promise<UserShort[]> {
    await delay();
    return [...(mockFollowers[userId] ?? [])];
  },

  async removeFollower({ userId, followId }: RemoveFollower): Promise<void> {
    await delay();

    if (userId !== currentUser.id) return;

    mockFollowers[userId] = (mockFollowers[userId] ?? []).filter(
      (user) => user.id !== followId,
    );

    mockFollowing[followId] = (mockFollowing[followId] ?? []).filter(
      (user) => user.id !== userId,
    );
  },
};
