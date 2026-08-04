/** @format */
import type { User } from "@/types/user";
import type { MediaAttachment } from "@/types/media";

export interface Tweet {
  id: string;
  content: string;
  attachments: MediaAttachment[];
  author: Pick<User, "id" | "username" | "displayName" | "avatarUrl">;
  likesCount: number;
  repliesCount: number;
  retweetsCount: number;
  likedByMe: boolean;
  createdAt: string;
}

export interface CreateTweetRequest {
  content: string;
  attachmentIds: string[];
}
