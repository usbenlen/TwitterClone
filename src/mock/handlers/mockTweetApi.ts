import { MOCK_DELAYS } from "@/mock/constants";
import { createMockPoll, updateMockPoll } from "@/mock/utils/mockPoll";
import {
  commentsByPostId,
  tweets,
  setTweets,
  nextTweetId,
  currentUser,
} from "@/mock/data";

import type {
  Tweet,
  CreateTweetRequest,
  UpdateTweetRequest,
  TweetQuote,
} from "@/types";

import { delay } from "@/mock/utils/delay";

import { mediaStore } from "@/mock/stores/mediaStore";
import { editHistoryStore } from "@/mock/stores/editHistoryStore";

import {
  toggleLikeInList,
  toggleRepostInList,
  toggleBookmarkInList,
  incrementViewsInList,
} from "@/mock/utils/mockTweetActions";
import {
  markQuotedTargetUnavailable,
  markQuotedTargetEdited,
} from "@/mock/utils/mockQuotes";
import { getQuoteReplyingToUsernames, withAncestors } from "@/utils/ancestors";

function resolveQuote(payload: CreateTweetRequest): TweetQuote | null {
  if (payload.quotedPostId && payload.quotedCommentId)
    throw new Error("Quote може посилатися лише на один матеріал.");

  const targetType = payload.quotedCommentId ? "comment" : "post";
  const targetId = payload.quotedCommentId ?? payload.quotedPostId;
  if (!targetId) return null;

  let target: Tweet | undefined;

  if (targetType === "comment") {
    for (const [postId, comments] of Object.entries(commentsByPostId)) {
      const comment = comments.find((item) => item.id === targetId);
      if (!comment) continue;

      const rootPost = tweets.find((item) => item.id === postId);
      target = withAncestors(comment, rootPost, comments);
      break;
    }
  } else {
    target = tweets.find((item) => item.id === targetId);
  }

  if (!target) throw new Error("Матеріал для Quote не знайдено.");

  const snapshot = editHistoryStore.getVersion(
    targetType,
    target,
    payload.quotedTargetVersionId,
  );

  if (!snapshot) throw new Error("Версію матеріалу для Quote не знайдено.");

  return {
    targetType,
    targetId,
    targetVersionId: snapshot.versionId,
    hasNewVersion: snapshot.versionId !== target.versionId,
    replyingToUsernames:
      targetType === "comment" ? getQuoteReplyingToUsernames(target) : [],
    target: {
      ...snapshot,
      quote: snapshot.quote ? { ...snapshot.quote, target: null } : null,
    },
  };
}

export const mockTweetApi = {
  async getFeed(): Promise<Tweet[]> {
    await delay();

    return [...tweets];
  },

  async getBookmarked(): Promise<Tweet[]> {
    await delay();

    return tweets.filter((tweet) => tweet.bookmarkedByMe);
  },

  async getById(id: string): Promise<Tweet> {
    await delay();

    const tweet = tweets.find((tweet) => tweet.id === id);

    if (!tweet) throw new Error("Пост не знайдено.");

    return tweet;
  },

  async getByUsername(username: string): Promise<Tweet[]> {
    await delay();

    return tweets.filter((tweet) => tweet.author.username === username);
  },

  async create(payload: CreateTweetRequest): Promise<Tweet> {
    await delay(MOCK_DELAYS.WRITE);

    const attachments = mediaStore.getMany(payload.mediaIds);
    const quote = resolveQuote(payload);

    const poll = payload.poll ? createMockPoll(payload.poll) : undefined;

    const tweet: Tweet = {
      id: nextTweetId(),
      versionId: crypto.randomUUID(),
      content: payload.content,

      attachments,
      poll,
      quote,

      author: currentUser,

      likesCount: 0,
      repliesCount: 0,
      retweetsCount: 0,
      viewsCount: 0,

      likedByMe: false,
      repostedByMe: false,
      bookmarkedByMe: false,

      createdAt: new Date().toISOString(),
      updatedAt: null,

      location: payload.location ?? null,
      linkPreview: payload.linkPreview ?? null,
    };

    setTweets([tweet, ...tweets]);
    editHistoryStore.recordCreation("post", tweet);

    return tweet;
  },

  async update(id: string, data: UpdateTweetRequest): Promise<Tweet> {
    await delay(MOCK_DELAYS.READ);

    const tweetIndex = tweets.findIndex((tweet) => tweet.id === id);

    if (tweetIndex === -1) throw new Error("Пост не знайдено.");

    const existing = tweets[tweetIndex];

    if (existing.author.id !== currentUser.id)
      throw new Error("Ви не можете редагувати цей пост.");

    const attachments = data.mediaIds
      ? mediaStore.getMany(data.mediaIds)
      : existing.attachments;

    const poll = updateMockPoll(data.poll, existing.poll);

    const updated: Tweet = {
      ...existing,
      versionId: crypto.randomUUID(),
      content: data.content !== undefined ? data.content : existing.content,
      attachments,
      poll,
      location: data.location !== undefined ? data.location : existing.location,
      linkPreview:
        data.linkPreview !== undefined
          ? data.linkPreview
          : existing.linkPreview,
      updatedAt: new Date().toISOString(),
    };

    let nextTweets = [...tweets];
    nextTweets[tweetIndex] = updated;
    nextTweets = markQuotedTargetEdited(nextTweets, "post", updated.id);

    setTweets(nextTweets);
    editHistoryStore.recordEdit("post", existing, updated);

    return updated;
  },

  async delete(id: string): Promise<void> {
    await delay(MOCK_DELAYS.COMMENT_READ);

    const tweet = tweets.find((item) => item.id === id);

    if (!tweet) throw new Error("Пост не знайдено.");

    if (tweet.author.id !== currentUser.id)
      throw new Error("Ви не можете видалити цей пост.");

    setTweets(
      markQuotedTargetUnavailable(
        tweets.filter((item) => item.id !== id),
        "post",
        id,
      ),
    );
    editHistoryStore.remove("post", id);
  },

  async getEditHistory(id: string) {
    await delay(MOCK_DELAYS.HISTORY);

    const tweet = tweets.find((item) => item.id === id);
    if (!tweet) throw new Error("Пост не знайдено.");

    return editHistoryStore.getHistory("post", tweet);
  },

  async toggleLike(id: string, likedByMe: boolean) {
    await delay(MOCK_DELAYS.REACTION);

    const result = toggleLikeInList(tweets, id, likedByMe);

    setTweets(result.items);

    return result.response;
  },

  async toggleRepost(id: string, repostedByMe: boolean) {
    await delay(MOCK_DELAYS.REACTION);

    const result = toggleRepostInList(tweets, id, repostedByMe);

    setTweets(result.items);

    return result.response;
  },

  async toggleBookmark(id: string, bookmarkedByMe: boolean) {
    await delay(MOCK_DELAYS.REACTION);

    const result = toggleBookmarkInList(tweets, id, bookmarkedByMe);

    setTweets(result.items);

    return result.response;
  },

  async view(id: string): Promise<void> {
    await delay(MOCK_DELAYS.VIEW);

    const updated = incrementViewsInList(tweets, id);

    setTweets(updated);
  },
};
