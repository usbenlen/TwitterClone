import type { UserShort } from "@/types/user";

export interface Comment {
  id: string;
  postId: string;
  parentCommentId?: string | null;

  content: string;
  author: UserShort;

  likesCount: number;
  isLikedByCurrentUser: boolean;

  retweetsCount?: number;
  isRepostedByCurrentUser?: boolean;

  repliesCount?: number;
  viewsCount?: number;

  isBookmarkedByCurrentUser?: boolean;

  createdAt: string;
  updatedAt?: string | null;

  isDeleted?: boolean;
}

export interface CreateCommentRequest {
  postId: string;
  parentCommentId?: string | null;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface ToggleCommentLikeResponse {
  likesCount: number;
  isLikedByCurrentUser: boolean;
}

export interface ToggleCommentRepostResponse {
  retweetsCount: number;
  isRepostedByCurrentUser: boolean;
}

export interface ToggleCommentBookmarkResponse {
  isBookmarkedByCurrentUser: boolean;
}
