import { MEDIA_STATUS } from "@/constants/app";
import {
  getMediaError,
  getPollError,
  getPostRulesError,
} from "@/utils/composerRules";

import type {
  ComposerMedia,
  ComposerPoll,
  ComposerSubmitData,
  LinkPreview,
  Location,
  UpdateScheduledPostRequest,
} from "@/types";

export interface ComposerValues {
  content: string;
  media: ComposerMedia[];
  poll?: ComposerPoll | null;
  location?: Location | null;
  linkPreview?: LinkPreview | null;
  scheduledAt?: string | null;
}

export function isComposerPollValid(poll: ComposerPoll): boolean {
  return (
    getPollError(
      poll.options.map((option) => option.text),
      poll.duration,
    ) === null
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
  if (values.scheduledAt && (values.poll || values.location))
    return "Запланований пост не може містити опитування чи локацію.";
  return null;
}

export function getComposerError(values: ComposerValues): string | null {
  const error = getComposerRulesError(values);
  if (error) return error;
  if (
    values.media.some(
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
            options: poll.options
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
          options: values.poll.options.map((option) => option.text),
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
