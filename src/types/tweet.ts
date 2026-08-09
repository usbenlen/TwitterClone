/** @format */
import type { User, TweetPoll, Location, Embed } from "@/types";
import type { MediaAttachment } from "@/types/media";

export interface Tweet {
  id: string;
  content: string;
  attachments: MediaAttachment[];
  embed?: Embed | null;
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
  mediaIds: string[];
  embed?: Embed | null;
  poll?: {
    options: string[];
    duration: number;
  };
  location?: Location | null;
}
