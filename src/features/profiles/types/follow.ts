export interface FollowRequest {
  targetUserId: string;
}

export interface RemoveFollower {
  userId: string;
  followId: string;
}
