import { MEDIA_STATUS } from "@/features/content/constants/media";
import {
  getMediaError,
  getPollError,
  getPostRulesError,
} from "@/features/content/lib/composer/composerRules";

import type {
  ComposerMedia,
  ComposerPoll,
  ComposerSubmitData,
  ComposerValues,
} from "@/features/content/types";
import type { UpdateScheduledPostRequest } from "@/features/scheduling/types";

export function isComposerPollValid(poll: ComposerPoll): boolean {
  return (
    getPollError(
      poll.options.map((option) => option.text),
      poll.duration,
    ) === null &&
    !poll.options.some((option) => option.image && !option.text.trim())
  );
}

export function getComposerRulesError(values: ComposerValues): string | null {
  const error = getPostRulesError({
    content: values.content,
    media: values.media,
    poll: values.poll
      ? {
          options: values.poll.options.map((option) => option.text),
          duration: values.poll.duration,
        }
      : null,
  });
  if (error) return error;
  if (values.poll?.options.some((option) => option.image && !option.text.trim()))
    return "Додайте текст до варіанта з фото.";
  if (values.poll?.options.some((option) => option.image && option.image.type !== "image"))
    return "До варіанта відповіді можна додати лише фото.";
  if (values.scheduledAt && (values.poll || values.location))
    return "Запланований пост не може містити опитування чи локацію.";
  return null;
}

export function getComposerError(values: ComposerValues): string | null {
  const error = getComposerRulesError(values);
  if (error) return error;
  if (
    [
      ...values.media,
      ...(values.poll?.options.flatMap((option) =>
        option.image ? [option.image] : [],
      ) ?? []),
    ].some(
      (item) => item.status !== MEDIA_STATUS.UPLOADED || !item.attachmentId,
    )
  )
    return "Дочекайтеся завантаження всіх вкладень або видаліть невдалі.";
  return null;
}

export function getUploadedMediaIds(media: ComposerMedia[]): string[] {
  return media.flatMap((item) =>
    item.attachmentId ? [item.attachmentId] : [],
  );
}

export function buildComposerPayload(
  values: ComposerValues,
): ComposerSubmitData {
  const error = getComposerError(values);
  if (error) throw new Error(error);
  const poll = values.poll;
  return {
    content: values.content.trim(),
    mediaIds: getUploadedMediaIds(values.media),
    poll:
      poll && poll.options.some((option) => option.text.trim())
        ? {
            options: poll.options.some((option) => option.image)
              ? poll.options
                  .filter((option) => option.text.trim())
                  .map((option) => ({
                    text: option.text.trim(),
                    ...(option.image
                      ? { mediaId: option.image.attachmentId }
                      : {}),
                  }))
              : poll.options
                  .map((option) => option.text.trim())
                  .filter(Boolean),
            duration: poll.duration,
          }
        : poll === null
          ? null
          : undefined,
    location: values.location,
    linkPreview: values.linkPreview,
  };
}

export function buildScheduledPostPayload(
  values: ComposerValues,
  scheduledAt: string,
): UpdateScheduledPostRequest {
  const error = getComposerError({ ...values, scheduledAt });
  if (error) throw new Error(error);
  return {
    content: values.content.trim(),
    mediaIds: getUploadedMediaIds(values.media),
    linkPreview: values.linkPreview,
    scheduledAt,
    mockMedia: values.media.flatMap((item) =>
      item.attachmentId && item.file
        ? [
            {
              attachmentId: item.attachmentId,
              file: item.file,
              type: item.type,
            },
          ]
        : [],
    ),
  };
}

function snapshot(values: ComposerValues) {
  return {
    content: values.content,
    media: values.media.map((item) => item.attachmentId ?? item.id),
    poll: values.poll
      ? {
          duration: values.poll.duration,
          options: values.poll.options.map((option) => ({
            text: option.text,
            image: option.image?.attachmentId ?? option.image?.id,
          })),
        }
      : null,
    location: values.location ?? null,
    linkPreview: values.linkPreview ?? null,
    scheduledAt: values.scheduledAt ?? null,
  };
}

export function hasComposerChanges(
  current: ComposerValues,
  initial: ComposerValues,
): boolean {
  return (
    JSON.stringify(snapshot(current)) !== JSON.stringify(snapshot(initial))
  );
}

export function canScheduleMedia(media: ComposerMedia[]): boolean {
  if (
    !media.every(
      (item) =>
        item.status === MEDIA_STATUS.UPLOADED && Boolean(item.attachmentId),
    )
  )
    return false;
  return getMediaError(media) === null;
}
