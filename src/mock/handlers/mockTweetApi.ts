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
  TweetPoll,
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
    await delay(300);

    const attachments = mediaStore.getMany(payload.mediaIds);
    const quote = resolveQuote(payload);

    const poll: TweetPoll | undefined = payload.poll
      ? {
          id: crypto.randomUUID(),
          totalVotes: 0,
          isClosed: false,
          expiresAt: new Date(
            Date.now() + payload.poll.duration * 60 * 1000,
          ).toISOString(),
          options: payload.poll.options.map((text) => ({
            id: crypto.randomUUID(),
            text,
            votesCount: 0,
          })),
        }
      : undefined;

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
      embed: payload.embed ?? null,
    };

    setTweets([tweet, ...tweets]);
    editHistoryStore.recordCreation("post", tweet);

    return tweet;
  },

  async update(id: string, data: UpdateTweetRequest): Promise<Tweet> {
    await delay(200);

    const tweetIndex = tweets.findIndex((tweet) => tweet.id === id);

    if (tweetIndex === -1) throw new Error("Пост не знайдено.");

    const existing = tweets[tweetIndex];

    if (existing.author.id !== currentUser.id)
      throw new Error("Ви не можете редагувати цей пост.");

    const attachments = data.mediaIds
      ? mediaStore.getMany(data.mediaIds)
      : existing.attachments;

    let poll = existing.poll;

    if (data.poll === null) {
      poll = undefined;
    } else if (data.poll && data.poll.options.length > 0) {
      poll = {
        id: existing.poll?.id ?? crypto.randomUUID(),
        totalVotes: existing.poll?.totalVotes ?? 0,
        isClosed: existing.poll?.isClosed ?? false,
        expiresAt: new Date(
          Date.now() + (data.poll.duration || 1440) * 60 * 1000,
        ).toISOString(),
        options: data.poll.options.map((text, index) => ({
          id: existing.poll?.options[index]?.id ?? crypto.randomUUID(),
          text,
          votesCount: existing.poll?.options[index]?.votesCount ?? 0,
        })),
      };
    }

    const updated: Tweet = {
      ...existing,
      versionId: crypto.randomUUID(),
      content: data.content !== undefined ? data.content : existing.content,
      attachments,
      poll,
      location: data.location !== undefined ? data.location : existing.location,
      embed: data.embed !== undefined ? data.embed : existing.embed,
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
    await delay(180);

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
    await delay(160);

    const tweet = tweets.find((item) => item.id === id);
    if (!tweet) throw new Error("Пост не знайдено.");

    return editHistoryStore.getHistory("post", tweet);
  },

  async toggleLike(id: string, likedByMe: boolean) {
    await delay(150);

    const result = toggleLikeInList(tweets, id, likedByMe);

    setTweets(result.items);

    return result.response;
  },

  async toggleRepost(id: string, repostedByMe: boolean) {
    await delay(150);

    const result = toggleRepostInList(tweets, id, repostedByMe);

    setTweets(result.items);

    return result.response;
  },

  async toggleBookmark(id: string, bookmarkedByMe: boolean) {
    await delay(150);

    const result = toggleBookmarkInList(tweets, id, bookmarkedByMe);

    setTweets(result.items);

    return result.response;
  },

  async view(id: string): Promise<void> {
    await delay(100);

    const updated = incrementViewsInList(tweets, id);

    setTweets(updated);
  },
};
