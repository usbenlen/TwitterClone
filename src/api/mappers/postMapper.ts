import type {
  BackendEditHistoryResponse,
  BackendPostMedia,
  BackendPollResponse,
  BackendPost,
  BackendRepostItem,
  BackendInteractionPage,
  CursorPage,
  EditHistoryResponse,
  Post,
  PostPoll,
  MediaAttachment,
} from "@/types";

import { apiClient } from "@/api/httpClient";
import { mapUserRole } from "@/api/mappers/profileMapper";

function normalizeMediaType(
  type: string,
  mimeType?: string,
): MediaAttachment["type"] {
  const normalizedType = type.toLowerCase();

  if (normalizedType === "video" || mimeType?.startsWith("video/"))
    return "video";
  if (normalizedType === "gif" || mimeType === "image/gif") return "gif";
  return "image";
}

function mapMediaAttachment(media: BackendPostMedia): MediaAttachment {
  return {
    id: media.id,
    type: normalizeMediaType(media.type, media.mimeType),
    url: media.url,
    thumbnailUrl: media.thumbnailUrl,
    width: media.width,
    height: media.height,
    duration: media.duration,
    sizeInBytes: media.sizeInBytes,
    mimeType: media.mimeType,
  };
}

function mapMedia(post: BackendPost): MediaAttachment[] {
  const mediaItems = post.media ?? post.attachments;

  if (Array.isArray(mediaItems) && mediaItems.length > 0) {
    return [...mediaItems]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(mapMediaAttachment);
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

export function mapBackendPollToPostPoll(
  poll: BackendPollResponse | null | undefined,
): PostPoll | undefined {
  if (!poll) return undefined;

  return {
    id: poll.id,
    options: [...poll.options]
      .sort((a, b) => a.position - b.position)
      .map((option) => ({
        id: option.id,
        text: option.text,
        votesCount: option.votesCount,
        ...(option.media ? { media: mapMediaAttachment(option.media) } : {}),
      })),
    totalVotes: poll.totalVotes,
    expiresAt: poll.endsAt ?? null,
    votedOptionId: poll.selectedOptionId ?? undefined,
    isClosed: poll.endsAt
      ? new Date(poll.endsAt).getTime() <= Date.now()
      : false,
  };
}

function mapBackendPostInternal(
  post: BackendPost,
  includeNestedQuote: boolean,
): Post {
  const quoteTarget =
    includeNestedQuote && post.quote?.target
      ? mapBackendPostInternal(post.quote.target, false)
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

    author: mapUserRole(post.author),

    attachments: mapMedia(post),

    poll: mapBackendPollToPostPoll(post.poll),
    location: post.location ?? null,
    linkPreview: post.linkPreview ?? null,
    quote:
      includeNestedQuote && post.quote
        ? {
            targetType: post.quote.targetType,
            targetId: post.quote.targetId,
            targetVersionId:
              post.quote.targetVersionId ?? quoteTarget?.versionId ?? "",
            hasNewVersion: post.quote.hasNewVersion ?? false,
            replyingToUsernames,
            target: quoteTarget,
          }
        : null,

    likesCount: post.likesCount,
    repliesCount: post.commentsCount ?? post.repliesCount ?? 0,
    retweetsCount: post.repostsCount,
    viewsCount: post.viewsCount,

    likedByMe: post.isLikedByCurrentUser,
    repostedByMe: post.isRepostedByCurrentUser ?? false,
    bookmarkedByMe: post.isBookmarkedByCurrentUser ?? post.bookmarkedByMe ?? false,

    createdAt: post.createdAt,
    updatedAt: post.updatedAt ?? null,
    actionAt: post.actionAt ?? null,

    isComment: post.isComment ?? Boolean(post.postId),
    postId: post.postId,
    parentCommentId: post.parentCommentId ?? null,
    replyToUsername: post.replyToUsername ?? null,
  };
}

export const mapBackendPost = (post: BackendPost): Post =>
  mapBackendPostInternal(post, true);

export function mapEditHistoryResponse(
  response: BackendEditHistoryResponse,
): EditHistoryResponse {
  return {
    targetType: response.targetType,
    targetId: response.targetId,
    versions: response.versions.map((version) =>
      mapBackendPostInternal(version, true),
    ),
  };
}

function isMappedPost(item: BackendRepostItem): item is Post {
  return "repliesCount" in item && "retweetsCount" in item;
}

export function mapRepostToPost(item: BackendRepostItem): Post {
  if (!isMappedPost(item)) return mapBackendPost(item);

  return {
    ...item,
    author: mapUserRole(item.author),
    ...(item.ancestors
      ? { ancestors: item.ancestors.map(mapRepostToPost) }
      : {}),
    ...(item.quote?.target
      ? {
          quote: { ...item.quote, target: mapRepostToPost(item.quote.target) },
        }
      : {}),
    isComment: item.isComment ?? Boolean(item.postId),
  };
}

export async function getMappedPosts(path: string): Promise<Post[]> {
  return (await apiClient.get<BackendPost[]>(path)).map(mapBackendPost);
}

export async function getMappedPostPage(
  path: string,
): Promise<CursorPage<Post>> {
  const page = await apiClient.get<CursorPage<BackendPost>>(path);

  return {
    ...page,
    items: page.items.map(mapBackendPost),
  };
}

export async function getMappedInteractionPage(
  path: string,
): Promise<CursorPage<Post>> {
  const page = await apiClient.get<BackendInteractionPage>(path);
  const items = [...page.posts, ...page.comments]
    .sort((left, right) => {
      const timeDifference =
        Date.parse(right.actionAt ?? right.createdAt) -
        Date.parse(left.actionAt ?? left.createdAt);
      return timeDifference || right.id.localeCompare(left.id);
    })
    .map(mapBackendPost);

  return {
    items,
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
  };
}
