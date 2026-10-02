import { MAX_TWEET_LENGTH, MEDIA } from "@/constants/app";
import { POLL } from "@/constants/poll";
import type { ComposerAction } from "@/types/composer";

export function countCharacters(text: string): number {
  return Array.from(text).length;
}

export interface MediaKind {
  type: "image" | "video" | "gif";
}

export function getMediaError(media: readonly MediaKind[]): string | null {
  if (media.length > MEDIA.MAX_ATTACHMENTS)
    return `Максимум ${MEDIA.MAX_ATTACHMENTS} вкладень.`;
  if (media.some((item) => item.type === "gif") && media.length !== 1)
    return "GIF має бути єдиним медіавкладенням у пості.";
  return null;
}

export function getMediaAdditionError(
  media: readonly MediaKind[],
  type: MediaKind["type"],
): string | null {
  return getMediaError([...media, { type }]);
}

export function getPollError(
  options: readonly string[],
  duration: number,
): string | null {
  const filled = options.map((text) => text.trim()).filter(Boolean);
  if (options.length > POLL.MAX_OPTIONS || filled.length < POLL.MIN_OPTIONS)
    return "Заповніть від 2 до 4 варіантів відповіді.";
  if (filled.some((text) => countCharacters(text) > POLL.MAX_OPTION_LENGTH))
    return `Варіант відповіді може містити максимум ${POLL.MAX_OPTION_LENGTH} символів.`;
  if (
    !Number.isInteger(duration) ||
    duration < POLL.MIN_DURATION_MINUTES ||
    duration > POLL.MAX_DURATION_MINUTES
  )
    return "Тривалість опитування має бути від 5 хвилин до 7 днів.";
  return null;
}

export function getPostRulesError(values: {
  content: string;
  media: readonly MediaKind[];
  poll?: { options: readonly string[]; duration?: number } | null;
}): string | null {
  if (countCharacters(values.content) > MAX_TWEET_LENGTH)
    return `Текст поста може містити максимум ${MAX_TWEET_LENGTH} символів.`;
  const mediaError = getMediaError(values.media);
  if (mediaError) return mediaError;
  if (values.poll && values.media.length)
    return "Медіа та опитування не можна поєднувати.";
  if (values.poll)
    return getPollError(
      values.poll.options,
      values.poll.duration ?? POLL.DEFAULT_DURATION_MINUTES,
    );
  return null;
}

export function getDisabledComposerActions(state: {
  media: readonly MediaKind[];
  hasPoll: boolean;
  hasLocation: boolean;
  scheduled: boolean;
  canSchedule: boolean;
  busy: boolean;
}): ComposerAction[] {
  if (state.busy)
    return ["image", "video", "gif", "poll", "location", "schedule", "emoji"];
  const disabled: ComposerAction[] = [];
  if (state.hasPoll || getMediaAdditionError(state.media, "image"))
    disabled.push("image", "video");
  if (state.hasPoll || state.media.length) disabled.push("gif");
  if (state.hasPoll || state.media.length || state.scheduled)
    disabled.push("poll");
  if (state.hasLocation || state.scheduled) disabled.push("location");
  if (!state.canSchedule || state.hasPoll || state.hasLocation)
    disabled.push("schedule");
  return disabled;
}
