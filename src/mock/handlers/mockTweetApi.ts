import { currentUser } from "@/mock/data/users";
import { tweets, setTweets, nextTweetId } from "@/mock/data/tweets";

import type { Tweet, CreateTweetRequest } from "@/types/tweet";
import type { TweetPoll } from "@/types/poll";

import { delay } from "@/mock/utils/delay";
import { mediaStore } from "@/mock/stores/mediaStore";

export const mockTweetApi = {
  async getFeed(): Promise<Tweet[]> {
    await delay();
    return [...tweets];
  },

  async getBookmarked(): Promise<Tweet[]> {
    await delay();
    return tweets.filter((t) => t.bookmarkedByMe);
  },

  async getById(id: string): Promise<Tweet> {
    await delay();

    const tweet = tweets.find((item) => item.id === id);

    if (!tweet) throw new Error("Пост не знайдено.");

    return tweet;
  },

  async getByUsername(username: string): Promise<Tweet[]> {
    await delay();
    return tweets.filter((t) => t.author.username === username);
  },

  async create(payload: CreateTweetRequest): Promise<Tweet> {
    await delay(300);

    const attachments = mediaStore.getMany(payload.mediaIds) ?? [];

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
      content: payload.content,

      attachments,
      poll,

      author: currentUser,

      likesCount: 0,
      repliesCount: 0,
      retweetsCount: 0,
      viewsCount: 0,

      likedByMe: false,
      repostedByMe: false,
      bookmarkedByMe: false,

      createdAt: new Date().toISOString(),

      location: payload.location ?? null,
      embed: payload.embed ?? null,
    };

    setTweets([tweet, ...tweets]);

    return tweet;
  },

  async toggleLike(id: string, likedByMe: boolean) {
    await delay(150);

    const updatedTweets = tweets.map((t) =>
      t.id === id
        ? {
            ...t,
            likedByMe: !likedByMe,
            likesCount: likedByMe ? t.likesCount - 1 : t.likesCount + 1,
          }
        : t,
    );

    setTweets(updatedTweets);

    const tweet = updatedTweets.find((t) => t.id === id)!;

    return {
      likedByMe: tweet.likedByMe,
      likesCount: tweet.likesCount,
    };
  },

  async toggleRepost(id: string, repostedByMe: boolean) {
    await delay(150);

    const updatedTweets = tweets.map((t) =>
      t.id === id
        ? {
            ...t,
            repostedByMe: !repostedByMe,
            retweetsCount: repostedByMe
              ? t.retweetsCount - 1
              : t.retweetsCount + 1,
          }
        : t,
    );

    setTweets(updatedTweets);

    const tweet = updatedTweets.find((t) => t.id === id)!;

    return {
      repostedByMe: tweet.repostedByMe,
      repostsCount: tweet.retweetsCount,
    };
  },

  async toggleBookmark(id: string, bookmarkedByMe: boolean) {
    await delay(150);

    const updatedTweets = tweets.map((t) =>
      t.id === id
        ? {
            ...t,
            bookmarkedByMe: !bookmarkedByMe,
          }
        : t,
    );

    setTweets(updatedTweets);

    const tweet = updatedTweets.find((t) => t.id === id)!;

    return {
      bookmarkedByMe: tweet.bookmarkedByMe,
    };
  },

  async view(id: string) {
    await delay(100);

    const updatedTweets = tweets.map((t) =>
      t.id === id
        ? {
            ...t,
            viewsCount: t.viewsCount + 1,
          }
        : t,
    );

    setTweets(updatedTweets);
  },

  async delete(id: string): Promise<void> {
    await delay(180);
    setTweets(tweets.filter((t) => t.id !== id));
  },
};
