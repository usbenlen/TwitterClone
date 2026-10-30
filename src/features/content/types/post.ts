import type { LinkPreview } from "@/features/content/types/linkPreview";
import type { Location } from "@/features/content/types/location";
import type { MediaAttachment } from "@/features/content/types/media";
import type { PollRequest, PostPoll } from "@/features/content/types/poll";
import type {
  SearchCriteria,
  SearchViewerContext,
} from "@/features/discovery/types";
import type { User } from "@/features/profiles/types";

export type QuoteTargetType = "post" | "comment";

export interface PostQuote {
  targetType: QuoteTargetType;
  targetId: string;
  targetVersionId: string;
  hasNewVersion: boolean;
  replyingToUsernames: string[];
  target: PostBase | null;
}

export interface PostBase {
  id: string;
  versionId: string;
  content: string;

  author: Pick<
    User,
    "id" | "username" | "displayName" | "avatarUrl" | "isVerified" | "role"
  >;

  attachments: MediaAttachment[];

  poll?: PostPoll;
  location?: Location | null;
  linkPreview?: LinkPreview | null;
  quote?: PostQuote | null;

  likesCount: number;
  repliesCount: number;
  retweetsCount: number;
  viewsCount: number;

  likedByMe: boolean;
  repostedByMe: boolean;
  bookmarkedByMe: boolean;

  createdAt: string;
  updatedAt?: string | null;
  actionAt?: string | null;

  isComment?: boolean;
  postId?: string;
  parentCommentId?: string | null;
  replyToUsername?: string | null;
}

export type PostAncestor = PostBase;

export interface Post extends PostBase {
  ancestors?: PostAncestor[];
}

export interface ThreadResponse {
  ancestors: PostAncestor[];
  target: Post;
  replies: Post[];
}

export interface EditHistoryResponse {
  targetType: QuoteTargetType;
  targetId: string;
  versions: PostBase[];
}

export interface CreatePostRequest {
  content: string;
  mediaIds: string[];
  linkPreview?: LinkPreview | null;
  poll?: PollRequest;
  location?: Location | null;
  quotedPostId?: string | null;
  quotedCommentId?: string | null;
  quotedTargetVersionId?: string | null;
}

export interface UpdatePostRequest {
  content?: string;
  mediaIds?: string[];
  linkPreview?: LinkPreview | null;
  poll?: PollRequest | null;
  location?: Location | null;
  removePoll?: boolean;
  removeLocation?: boolean;
  removeLinkPreview?: boolean;
}

export interface CreateCommentRequest {
  postId: string;
  parentCommentId?: string | null;

  content: string;
  mediaIds?: string[];

  poll?: PollRequest;

  location?: Location | null;
  linkPreview?: LinkPreview | null;
}

export interface UpdateCommentRequest {
  content: string;
  mediaIds?: string[];

  poll?: PollRequest | null;

  location?: Location | null;
  linkPreview?: LinkPreview | null;
  removePoll?: boolean;
  removeLocation?: boolean;
  removeLinkPreview?: boolean;
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

export type ProfileTab = "posts" | "replies" | "likes" | "reposts";

export type PostsQuery =
  | { kind: "feed" | "bookmarks" }
  | { kind: "comments"; postId: string }
  | { kind: "profile"; username: string; tab: ProfileTab }
  | { kind: "search"; criteria: SearchCriteria; viewer: SearchViewerContext };

export interface Target {
  id: string;
  type: "post" | "comment";
}

export type Reaction = Target &
  (
    | { action: "like" | "repost" | "bookmark"; active: boolean }
    | { action: "vote"; optionId: string; poll: NonNullable<Post["poll"]> }
  );

export type CommentThreadRow =
  | { type: "comment"; comment: Post }
  | { type: "show-replies"; parentId: string };
