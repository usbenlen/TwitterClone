import { MILLISECONDS_PER_MINUTE, POLL } from "@/constants";

import type { CreateTweetRequest, TweetPoll } from "@/types";

export function createMockPoll(
  input: NonNullable<CreateTweetRequest["poll"]>,
  existing?: TweetPoll,
): TweetPoll {
  return {
    id: existing?.id ?? crypto.randomUUID(),
    totalVotes: existing?.totalVotes ?? 0,
    isClosed: existing?.isClosed ?? false,
    expiresAt: new Date(
      Date.now() + input.duration * MILLISECONDS_PER_MINUTE,
    ).toISOString(),
    options: input.options
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text, index) => ({
        id: existing?.options[index]?.id ?? crypto.randomUUID(),
        text,
        votesCount: existing?.options[index]?.votesCount ?? 0,
      })),
  };
}

export function updateMockPoll(
  input: CreateTweetRequest["poll"] | null,
  existing?: TweetPoll,
): TweetPoll | undefined {
  if (input === null) return undefined;
  return input?.options.length
    ? createMockPoll(
        { ...input, duration: input.duration || POLL.DEFAULT_DURATION_MINUTES },
        existing,
      )
    : existing;
}
