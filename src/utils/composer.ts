import { MEDIA, MEDIA_STATUS } from "@/constants/app";
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

export function getUploadedMediaIds(media: ComposerMedia[]): string[] {
  return media.flatMap((item) =>
    item.attachmentId ? [item.attachmentId] : [],
  );
}

export function buildComposerPayload(
  values: ComposerValues,
): ComposerSubmitData {
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
  return media.every((item) => item.type === "image")
    ? media.length <= MEDIA.MAX_ATTACHMENTS
    : media.length === 1 &&
        (media[0].type === "video" || media[0].type === "gif");
}
