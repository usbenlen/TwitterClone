/** @format */
import type { User } from "@/types/user";

export interface Tweet {
  id: string;
  content: string;
  author: Pick<User, "id" | "username" | "displayName" | "avatarUrl">;
  likesCount: number;
  repliesCount: number;
  retweetsCount: number;
  likedByMe: boolean;
  createdAt: string;
}
