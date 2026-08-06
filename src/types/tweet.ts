/** @format */
import type { User } from "@/types/user";
import type { MediaAttachment } from "@/types/media";
import type { TweetPoll } from "@/types/poll";
import type { Location } from "@/types/location";

export interface Tweet {
  id: string;
  content: string;
  attachments: MediaAttachment[];
  poll?: TweetPoll;
  author: Pick<User, "id" | "username" | "displayName" | "avatarUrl">;
  likesCount: number;
  repliesCount: number;
  retweetsCount: number;
  likedByMe: boolean;
  location?: Location | null;
  createdAt: string;
}

export interface CreateTweetMedia {
  type: "image" | "video" | "gif";
  attachmentId?: string;
  url?: string;
}

export interface CreateTweetRequest {
  content: string;
  media: CreateTweetMedia[];
  poll?: {
    options: string[];
    duration: number;
  };
  location?: Location | null;
}
