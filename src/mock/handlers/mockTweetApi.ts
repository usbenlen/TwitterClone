/** @format */

import type { Tweet, CreateTweetRequest } from "@/types/tweet";
import type { TweetPoll } from "@/types/poll";

import { delay } from "@/mock/utils/delay";
import { currentUser } from "@/mock/data/users";
import { tweets, setTweets, nextTweetId } from "@/mock/data/tweets";
import { mediaStore } from "@/mock/stores/mediaStore";

export const mockTweetApi = {
  async getFeed(): Promise<Tweet[]> {
    await delay();
    return [...tweets];
  },

  async getByUsername(username: string): Promise<Tweet[]> {
    await delay();
    return tweets.filter((t) => t.author.username === username);
  },

  async create(payload: CreateTweetRequest): Promise<Tweet> {
    await delay(300);

    const attachments = mediaStore.getMany(payload.mediaIds);

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

      likedByMe: false,

      createdAt: new Date().toISOString(),

      location: payload.location ?? null,
      embed: payload.embed ?? null,
    };

    setTweets([tweet, ...tweets]);

    return tweet;
  },

  async toggleLike(id: string) {
    await delay(150);

    const updatedTweets = tweets.map((t) =>
      t.id === id
        ? {
            ...t,
            likedByMe: !t.likedByMe,
            likesCount: t.likedByMe ? t.likesCount - 1 : t.likesCount + 1,
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
};
