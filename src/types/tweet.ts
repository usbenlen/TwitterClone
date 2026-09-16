import type { User, TweetPoll, Location, Embed } from "@/types";
import type { MediaAttachment } from "@/types/media";

export type QuoteTargetType = "post" | "comment";

export interface TweetQuote {
  targetType: QuoteTargetType;
  targetId: string;
  targetVersionId: string;
  hasNewVersion: boolean;
  replyingToUsernames: string[];
  target: TweetBase | null;
}

export interface TweetBase {
  id: string;
  versionId: string;
  content: string;

  author: Pick<
    User,
    "id" | "username" | "displayName" | "avatarUrl" | "isVerified"
  >;

  attachments: MediaAttachment[];

  poll?: TweetPoll;
  location?: Location | null;
  embed?: Embed | null;
  quote?: TweetQuote | null;

  likesCount: number;
  repliesCount: number;
  retweetsCount: number;
  viewsCount: number;

  likedByMe: boolean;
  repostedByMe: boolean;
  bookmarkedByMe: boolean;

  createdAt: string;
  updatedAt?: string | null;

  isComment?: boolean;
  postId?: string;
  parentCommentId?: string | null;
  replyToUsername?: string | null;
}

export type TweetAncestor = TweetBase;

export interface Tweet extends TweetBase {
  ancestors?: TweetAncestor[];
}

export interface ThreadResponse {
  ancestors: TweetAncestor[];
  target: Tweet;
  replies: Tweet[];
}

export interface EditHistoryResponse {
  targetType: QuoteTargetType;
  targetId: string;
  versions: TweetBase[];
}

export interface CommentThreadItem {
  id: string;
  target: Tweet;
  ancestors: TweetAncestor[];
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
  quotedPostId?: string | null;
  quotedCommentId?: string | null;
  quotedTargetVersionId?: string | null;
}

export interface UpdateTweetRequest {
  content?: string;
  mediaIds?: string[];
  embed?: Embed | null;
  poll?: {
    options: string[];
    duration: number;
  } | null;
  location?: Location | null;
}

export interface CreateCommentRequest {
  postId: string;
  parentCommentId?: string | null;

  content: string;
  mediaIds?: string[];

  poll?: {
    options: string[];
    duration: number;
  };

  location?: Location | null;
  embed?: Embed | null;
}

export interface UpdateCommentRequest {
  content?: string;
  mediaIds?: string[];

  poll?: {
    options: string[];
    duration: number;
  } | null;

  location?: Location | null;
  embed?: Embed | null;
}

export interface ToggleLikeResponse {
  likedByMe: boolean;
  likesCount: number;
}

export interface ToggleRepostResponse {
  repostedByMe: boolean;
  repostsCount: number;
}

export interface ToggleBookmarkResponse {
  bookmarkedByMe?: boolean;
}
