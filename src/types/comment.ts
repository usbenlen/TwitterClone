/** @format */

import type { UserShort } from "@/types/user";

export interface Comment {
  id: string;
  postId: string;
  parentCommentId?: string | null;
  content: string;
  author: UserShort;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateCommentRequest {
  postId: string;
  parentCommentId?: string | null;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}
