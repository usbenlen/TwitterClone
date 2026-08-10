/** @format */

import type {
  BackendPollResponse,
  BackendPost,
} from "@/api/mappers/post.mapper";
import type { UserShort } from "@/types";

import { sampleAuthors, tweets } from "@/mock/data";
import { delay } from "@/mock/utils/delay";

function mapMockPoll(tweetId: string, poll: typeof tweets[number]["poll"]) {
  if (!poll) return null;

  return {
    id: poll.id,
    postId: tweetId,
    endsAt: poll.expiresAt,
    totalVotes: poll.totalVotes,
    hasVotedByCurrentUser: Boolean(poll.votedOptionId),
    selectedOptionId: poll.votedOptionId ?? null,
    options: poll.options.map((option, index) => ({
      id: option.id,
      text: option.text,
      position: index,
      votesCount: option.votesCount,
    })),
  } satisfies BackendPollResponse;
}

export const mockSearchApi = {
  async users(query: string): Promise<UserShort[]> {
    await delay(250);

    const value = query.trim().toLowerCase();

    if (!value) return [];

    return sampleAuthors
      .filter(
        (user) =>
          user.username.toLowerCase().includes(value) ||
          (user.displayName ?? "").toLowerCase().includes(value) ||
          (user.location?.name ?? "").toLowerCase().includes(value) ||
          (user.location?.country ?? "").toLowerCase().includes(value),
      )
      .map((user) => ({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        location: user.location,
        avatarUrl: user.avatarUrl ?? null,
        isVerified: user.isVerified,
      }));
  },

  async posts(query: string): Promise<BackendPost[]> {
    await delay(250);

    const value = query.trim().toLowerCase();

    if (!value) return [];

    return tweets
      .filter((tweet) => tweet.content.toLowerCase().includes(value))
      .map(
        (tweet): BackendPost => ({
          id: tweet.id,
          content: tweet.content,
          author: tweet.author,

          media: tweet.attachments.map((attachment, index) => ({
            id: attachment.id,
            url: attachment.url,
            type: attachment.type,
            sortOrder: index,
            thumbnailUrl: attachment.thumbnailUrl,
            width: attachment.width,
            height: attachment.height,
            duration: attachment.duration,
            mimeType: attachment.mimeType ?? "",
            sizeInBytes: attachment.sizeInBytes ?? 0,
            fileName: "",
          })),

          poll: mapMockPoll(tweet.id, tweet.poll),
          location: tweet.location ?? undefined,
          embed: tweet.embed ?? undefined,

          likesCount: tweet.likesCount,
          commentsCount: tweet.repliesCount,
          repostsCount: tweet.retweetsCount,
          viewsCount: tweet.viewsCount,

          isLikedByCurrentUser: tweet.likedByMe,
          isRepostedByCurrentUser: tweet.repostedByMe,

          createdAt: tweet.createdAt,
          updatedAt: tweet.updatedAt ?? null,
        }),
      );
  },
};
