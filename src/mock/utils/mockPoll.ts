import { MILLISECONDS_PER_MINUTE, POLL } from "@/constants";

import type { CreateTweetRequest, TweetPoll } from "@/types";
import { mediaStore } from "@/mock/stores/mediaStore";

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
      .map((option) =>
        typeof option === "string"
          ? { text: option.trim() }
          : { ...option, text: option.text.trim() },
      )
      .filter((option) => option.text)
      .map((option, index) => {
        const mediaId = "mediaId" in option ? option.mediaId : undefined;
        const media = mediaId ? mediaStore.get(mediaId) : undefined;

        if (mediaId && !media) throw new Error("Фото варіанта відповіді не знайдено");
        if (media && media.type !== "image") throw new Error("До варіанта відповіді можна додати лише фото");

        return {
          id: existing?.options[index]?.id ?? crypto.randomUUID(),
          text: option.text,
          votesCount: existing?.options[index]?.votesCount ?? 0,
          ...(media ? { media: { ...media } } : {}),
        };
      }),
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
