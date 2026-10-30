import type { CursorPage } from "@/types/api";

import type { BackendUser } from "@/types/user.dto";

import type { QuoteTargetType, Post } from "@/types/post";

export interface BackendEditHistoryResponse {
  targetType: QuoteTargetType;
  targetId: string;
  versions: BackendPost[];
  nextCursor?: string | null;
  hasMore?: boolean;
}

export interface BackendPostMedia {
  id: string;
  url: string;
  thumbnailUrl?: string;

  width?: number;
  height?: number;
  duration?: number;

  fileName: string;
  mimeType: string;
  type: string;
  sizeInBytes: number;

  sortOrder: number;
}

export interface BackendPollOption {
  id: string;
  text: string;
  position: number;
  votesCount: number;
  media?: BackendPostMedia | null;
}

export interface BackendPollResponse {
  id: string;
  postId: string;
  endsAt?: string | null;
  totalVotes: number;
  hasVotedByCurrentUser: boolean;
  selectedOptionId?: string | null;
  options: BackendPollOption[];
}

export interface BackendPost {
  id: string;
  versionId: string;
  content: string;

  author: BackendUser<Post["author"]>;

  media?: BackendPostMedia[];
  attachments?: BackendPostMedia[];
  mediaUrls?: string[];

  poll?: BackendPollResponse | null;
  location?: Post["location"];
  linkPreview?: Post["linkPreview"];
  quote?: {
    targetType: QuoteTargetType;
    targetId: string;
    targetVersionId: string;
    hasNewVersion: boolean;
    replyingToUsernames?: string[];
    target?: BackendPost | null;
  } | null;

  likesCount: number;
  commentsCount?: number;
  repliesCount?: number;
  repostsCount: number;
  viewsCount: number;

  isLikedByCurrentUser: boolean;
  isRepostedByCurrentUser?: boolean;
  isBookmarkedByCurrentUser?: boolean;
  bookmarkedByMe?: boolean;

  createdAt: string;
  updatedAt?: string | null;
  actionAt?: string | null;

  isComment?: boolean;
  postId?: string;
  parentCommentId?: string | null;
  replyToUsername?: string | null;
}

export type BackendRepostItem = BackendPost | Post;

export interface BackendInteractionPage {
  posts: BackendPost[];
  comments: BackendPost[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface BackendThreadResponse {
  post: BackendPost;
  ancestors: BackendPost[];
  target: BackendPost;
  replies: CursorPage<BackendPost>;
}
