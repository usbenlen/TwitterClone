/** @format */
import type { User, TweetPoll, Location, Embed } from "@/types";
import type { MediaAttachment } from "@/types/media";

export interface Tweet {
  id: string;
  content: string;

  author: Pick<User, "id" | "username" | "displayName" | "avatarUrl" | "isVerified">;

  attachments: MediaAttachment[];

  poll?: TweetPoll;
  location?: Location | null;
  embed?: Embed | null;

  likesCount: number;
  repliesCount: number;
  retweetsCount: number;
  viewsCount: number;

  likedByMe: boolean;
  repostedByMe: boolean;
  bookmarkedByMe: boolean;

  createdAt: string;
  updatedAt?: string | null;
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
