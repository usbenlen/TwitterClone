import { getPostRulesError } from "@/features/content/lib/composer/composerRules";
import { mediaStore } from "@/mock/stores/mediaStore";

import type {
  CreatePostRequest,
  MediaAttachment,
  PostPoll,
} from "@/features/content/types";

export function resolveMockMedia(ids: string[]): MediaAttachment[] {
  const media = mediaStore.getMany(ids);
  if (media.length !== ids.length) throw new Error("Медіавкладення не знайдено.");

  return media;
}

export function validateMockPost(
  content: string,
  media: MediaAttachment[],
  poll?: CreatePostRequest["poll"] | PostPoll | null,
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
  if (
    poll?.options.some(
      (option) =>
        typeof option !== "string" &&
        "mediaId" in option &&
        option.mediaId &&
        !option.text.trim(),
    )
  )
    throw new Error("Додайте текст до варіанта з фото.");
}
