import type {
  EditHistoryResponse,
  QuoteTargetType,
  Tweet,
  TweetPoll,
  MediaAttachment,
} from "@/types";

export interface BackendEditHistoryResponse {
  targetType: QuoteTargetType;
  targetId: string;
  versions: BackendPost[];
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
}

export interface BackendPollResponse {
  id: string;
  postId: string;
  endsAt: string;
  totalVotes: number;
  hasVotedByCurrentUser: boolean;
  selectedOptionId?: string | null;
  options: BackendPollOption[];
}

export interface BackendPost {
  id: string;
  versionId: string;
  content: string;

  author: Tweet["author"];

  media?: BackendPostMedia[];
  mediaUrls?: string[];

  poll?: BackendPollResponse | null;
  location?: Tweet["location"];
  linkPreview?: Tweet["linkPreview"];
  quote?: {
    targetType: QuoteTargetType;
    targetId: string;
    targetVersionId: string;
    hasNewVersion: boolean;
    replyingToUsernames?: string[];
    target?: BackendPost | null;
  } | null;

  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  viewsCount: number;

  isLikedByCurrentUser: boolean;
  isRepostedByCurrentUser?: boolean;
  isBookmarkedByCurrentUser?: boolean;
  bookmarkedByMe?: boolean;

  createdAt: string;
  updatedAt?: string | null;

  isComment?: boolean;
  postId?: string;
  parentCommentId?: string | null;
  replyToUsername?: string | null;
}

export type BackendRepostItem = BackendPost | Tweet;

function normalizeMediaType(
  type: string,
  mimeType?: string,
): MediaAttachment["type"] {
  const normalizedType = type.toLowerCase();

  if (normalizedType === "video" || mimeType?.startsWith("video/")) return "video";
  if (normalizedType === "gif" || mimeType === "image/gif") return "gif";
  return "image";
}

function mapMedia(post: BackendPost): MediaAttachment[] {
  if (Array.isArray(post.media) && post.media.length > 0) {
    return [...post.media]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((media) => ({
        id: media.id,
        type: normalizeMediaType(media.type, media.mimeType),
        url: media.url,
        thumbnailUrl: media.thumbnailUrl,
        width: media.width,
        height: media.height,
        duration: media.duration,
        sizeInBytes: media.sizeInBytes,
        mimeType: media.mimeType,
      }));
  }

  if (Array.isArray(post.mediaUrls)) {
    return post.mediaUrls.map((url, index) => ({
      id: `${post.id}-media-${index}`,
      type: "image",
      url,
    }));
  }

  return [];
}

export function mapBackendPollToTweetPoll(
  poll: BackendPollResponse | null | undefined,
): TweetPoll | undefined {
  if (!poll) return undefined;

  return {
    id: poll.id,
    options: [...poll.options]
      .sort((a, b) => a.position - b.position)
      .map((option) => ({
        id: option.id,
        text: option.text,
        votesCount: option.votesCount,
      })),
    totalVotes: poll.totalVotes,
    expiresAt: poll.endsAt,
    votedOptionId: poll.selectedOptionId ?? undefined,
    isClosed: new Date(poll.endsAt).getTime() <= Date.now(),
  };
}

function mapPostToTweetInternal(
  post: BackendPost,
  includeNestedQuote: boolean,
): Tweet {
  const quoteTarget =
    includeNestedQuote && post.quote?.target
      ? mapPostToTweetInternal(post.quote.target, false)
      : null;

  const replyingToUsernames = Array.from(
    new Set(
      post.quote?.replyingToUsernames ??
        (quoteTarget?.replyToUsername ? [quoteTarget.replyToUsername] : []),
    ),
  ).filter((username) => username && username !== quoteTarget?.author.username);

  return {
    id: post.id,
    versionId: post.versionId ?? post.updatedAt ?? post.createdAt,
    content: post.content,

    author: post.author,

    attachments: mapMedia(post),

    poll: mapBackendPollToTweetPoll(post.poll),
    location: post.location ?? null,
    linkPreview: post.linkPreview ?? null,
    quote:
      includeNestedQuote && post.quote
        ? {
            targetType: post.quote.targetType,
            targetId: post.quote.targetId,
            targetVersionId: post.quote.targetVersionId ?? quoteTarget?.versionId ?? "",
            hasNewVersion: post.quote.hasNewVersion ?? false,
            replyingToUsernames,
            target: quoteTarget,
          }
        : null,

    likesCount: post.likesCount,
    repliesCount: post.commentsCount,
    retweetsCount: post.repostsCount,
    viewsCount: post.viewsCount,

    likedByMe: post.isLikedByCurrentUser,
    repostedByMe: post.isRepostedByCurrentUser ?? false,
    bookmarkedByMe:
      post.isBookmarkedByCurrentUser ?? post.bookmarkedByMe ?? false,

    createdAt: post.createdAt,
    updatedAt: post.updatedAt ?? null,

    isComment: post.isComment ?? Boolean(post.postId),
    postId: post.postId,
    parentCommentId: post.parentCommentId ?? null,
    replyToUsername: post.replyToUsername ?? null,
  };
}

export const mapPostToTweet = (post: BackendPost): Tweet => mapPostToTweetInternal(post, true);

export function mapEditHistoryResponse(
  response: BackendEditHistoryResponse,
): EditHistoryResponse {
  return {
    targetType: response.targetType,
    targetId: response.targetId,
    versions: response.versions.map((version) =>
      mapPostToTweetInternal(version, true),
    ),
  };
}

function isMappedTweet(item: BackendRepostItem): item is Tweet {
  return "repliesCount" in item && "retweetsCount" in item;
}

export function mapRepostToTweet(item: BackendRepostItem): Tweet {
  if (!isMappedTweet(item)) return mapPostToTweet(item);

  return {
    ...item,
    isComment: item.isComment ?? Boolean(item.postId),
  };
}
