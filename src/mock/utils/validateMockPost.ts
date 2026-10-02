import { mediaStore } from "@/mock/stores/mediaStore";
import { getPostRulesError } from "@/utils/composerRules";
import type { CreateTweetRequest, MediaAttachment, TweetPoll } from "@/types";

export function resolveMockMedia(ids: string[]): MediaAttachment[] {
  const media = mediaStore.getMany(ids);
  if (media.length !== ids.length)
    throw new Error("Медіавкладення не знайдено.");
  return media;
}

export function validateMockPost(
  content: string,
  media: MediaAttachment[],
  poll?: CreateTweetRequest["poll"] | TweetPoll | null,
): void {
  const error = getPostRulesError({
    content,
    media,
    poll: poll
      ? {
          options: poll.options.map((option) =>
            typeof option === "string" ? option : option.text,
          ),
          duration: "duration" in poll ? poll.duration : undefined,
        }
      : null,
  });
  if (error) throw new Error(error);
}
