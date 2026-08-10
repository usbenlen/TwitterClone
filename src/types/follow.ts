/** @format */

export interface FollowRequest {
  targetUserId: string;
}

export interface FollowUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface RemoveFollower {
  userId: string;
  followId: string;
}
