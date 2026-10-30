import type {
  CreateCommentRequest,
  CreatePostRequest,
  LinkPreview,
  PollRequest,
  UpdateCommentRequest,
  UpdatePostRequest,
} from "@/features/content/types";

const mapPoll = (poll: PollRequest) => ({
  options: poll.options,
  endsAt: new Date(Date.now() + poll.duration * 60_000).toISOString(),
});

const mapLinkPreview = (preview: LinkPreview) => ({
  url: preview.url,
  title: preview.title || undefined,
  imageUrl: preview.imageUrl || undefined,
});

export function mapCreatePostRequest(
  data: CreatePostRequest | CreateCommentRequest,
) {
  return {
    ...data,
    ...(data.poll ? { poll: mapPoll(data.poll) } : {}),
    ...(data.linkPreview
      ? { linkPreview: mapLinkPreview(data.linkPreview) }
      : {}),
  };
}

export function mapUpdateRequest(
  data: UpdatePostRequest | UpdateCommentRequest,
) {
  const {
    poll,
    location,
    linkPreview,
    removePoll,
    removeLocation,
    removeLinkPreview,
    ...fields
  } = data;

  if (removePoll && poll)
    throw new Error("Не можна одночасно оновити й видалити опитування.");
  if (removeLocation && location)
    throw new Error("Не можна одночасно оновити й видалити локацію.");
  if (removeLinkPreview && linkPreview)
    throw new Error("Не можна одночасно оновити й видалити прев’ю посилання.");

  return {
    ...fields,
    ...(poll ? { poll: mapPoll(poll) } : {}),
    ...(poll === null || removePoll ? { removePoll: true } : {}),
    ...(location ? { location } : {}),
    ...(location === null || removeLocation ? { removeLocation: true } : {}),
    ...(linkPreview ? { linkPreview: mapLinkPreview(linkPreview) } : {}),
    ...(linkPreview === null || removeLinkPreview
      ? { removeLinkPreview: true }
      : {}),
  };
}

export const mapScheduledLinkPreview = (
  preview: LinkPreview | null | undefined,
) => (preview ? mapLinkPreview(preview) : preview);
