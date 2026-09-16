import { useMemo, useState } from "react";
import { useScheduledPosts } from "@/hooks/useScheduledPosts.ts";

import {
  useComposerActions,
  useComposerSubmit,
  useComposerEditor,
  useTweetComposerMedia,
  useComposerLinkPreview,
} from "@/hooks/composer";

import { MAX_TWEET_LENGTH, MEDIA_STATUS } from "@/constants/app";

import type {
  Gif,
  Location,
  LinkPreview,
  ComposerMedia,
  ComposerPoll,
  Tweet,
  ComposerSubmitData,
  UpdateScheduledPostRequest,
} from "@/types";

interface UseTweetComposerProps {
  initialContent?: string;
  initialMedia?: ComposerMedia[];
  initialPoll?: ComposerPoll | null;
  initialLocation?: Location | null;
  initialLinkPreview?: LinkPreview | null;
  initialScheduledAt?: string | null;
  allowEmptySubmit?: boolean;
  onCreated?: (tweet: Tweet) => void;
  onSubmit?: (data: ComposerSubmitData) => Promise<unknown>;
  allowScheduling?: boolean;
  scheduleSubmitLabel?: string;
  showScheduledPostsLink?: boolean;
  canClearSchedule?: boolean;
  onScheduledSubmit?: (data: UpdateScheduledPostRequest) => Promise<unknown>;
}

export function useTweetComposer({
  initialContent = "",
  initialMedia = [],
  initialPoll = null,
  initialLocation = null,
  initialLinkPreview = null,
  initialScheduledAt = null,
  allowEmptySubmit = false,
  onCreated,
  onSubmit,
  allowScheduling = false,
  scheduleSubmitLabel = "Запланувати",
  showScheduledPostsLink = true,
  canClearSchedule = true,
  onScheduledSubmit,
}: UseTweetComposerProps = {}) {
  const [content, setContent] = useState(initialContent);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation,
  );
  const [scheduledAt, setScheduledAt] = useState<string | null>(
    initialScheduledAt,
  );
  const [scheduleDraftAt, setScheduleDraftAt] = useState<string | null>(null);
  const [isScheduleListOpen, setIsScheduleListOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const scheduledPosts = useScheduledPosts();
  const cursor = useComposerEditor();
  const linkPreview = useComposerLinkPreview(content, initialLinkPreview);

  const remaining = useMemo(() => MAX_TWEET_LENGTH - content.length, [content]);

  const mediaManager = useTweetComposerMedia(initialMedia);

  const hasBlockedMedia = mediaManager.media.some(
    (item) =>
      item.status === MEDIA_STATUS.UPLOADING ||
      item.status === MEDIA_STATUS.COMPRESSING ||
      item.status === MEDIA_STATUS.ERROR,
  );

  const {
    imageInputRef,
    videoInputRef,
    handleAction,
    closeAllPopups,

    buttonRefs,

    emoji,
    gif,
    poll,
    location,
    schedule,
  } = useComposerActions(initialPoll);

  const { submit: submitComposer, isPosting: isPostingNow } = useComposerSubmit(
    {
      content,
      media: mediaManager.media,
      poll: poll.hasPoll ? poll.poll : null,
      location: selectedLocation,
      linkPreview: linkPreview.preview,

      clearMedia: mediaManager.clearMedia,
      clearErrors: mediaManager.clearErrors,

      onCreated: onCreated || (() => {}),
      onSubmit,
    },
  );

  const isPosting = isPostingNow || isScheduling;

  const hasScheduleCompatibleMedia = useMemo(() => {
    if (mediaManager.media.length === 0) return true;

    const allMediaUploaded = mediaManager.media.every(
      (item) =>
        item.status === MEDIA_STATUS.UPLOADED && Boolean(item.attachmentId),
    );
    if (!allMediaUploaded) return false;

    if (mediaManager.media.every((item) => item.type === "image"))
      return mediaManager.media.length <= 4;

    return (
      mediaManager.media.length === 1 &&
      ["video", "gif"].includes(mediaManager.media[0].type)
    );
  }, [mediaManager.media]);

  const hasPostContent = Boolean(
    content.trim().length > 0 ||
    mediaManager.media.length > 0 ||
    linkPreview.preview,
  );

  const canOpenSchedule =
    allowScheduling &&
    hasPostContent &&
    remaining >= 0 &&
    !isPosting &&
    !hasBlockedMedia &&
    !poll.hasPoll &&
    selectedLocation === null &&
    hasScheduleCompatibleMedia;

  const initialMediaIds = initialMedia.map(
    (item) => item.attachmentId ?? item.id,
  );
  const currentMediaIds = mediaManager.media.map(
    (item) => item.attachmentId ?? item.id,
  );
  const normalizedInitialPoll = initialPoll
    ? {
        duration: initialPoll.duration,
        options: initialPoll.options.map((option) => option.text),
      }
    : null;
  const normalizedCurrentPoll = poll.hasPoll
    ? {
        duration: poll.poll.duration,
        options: poll.poll.options.map((option) => option.text),
      }
    : null;
  const hasChanges =
    content !== initialContent ||
    JSON.stringify(currentMediaIds) !== JSON.stringify(initialMediaIds) ||
    JSON.stringify(normalizedCurrentPoll) !==
      JSON.stringify(normalizedInitialPoll) ||
    JSON.stringify(selectedLocation) !== JSON.stringify(initialLocation) ||
    JSON.stringify(linkPreview.preview) !==
      JSON.stringify(initialLinkPreview) ||
    scheduledAt !== initialScheduledAt;

  const canSubmit =
    (allowEmptySubmit ||
      Boolean(
        content.trim().length > 0 ||
        mediaManager.media.length > 0 ||
        poll.hasPoll ||
        selectedLocation ||
        linkPreview.preview,
      )) &&
    remaining >= 0 &&
    !isPosting &&
    !hasBlockedMedia &&
    (!scheduledAt || canOpenSchedule);

  const onFilesSelected = (files: FileList | null) => {
    mediaManager.addFiles(files);
  };

  const submit = async () => {
    if (!canSubmit) return;

    if (scheduledAt && allowScheduling) {
      setIsScheduling(true);
      try {
        const payload = {
          content: content.trim(),
          mediaIds: mediaManager.media
            .filter((item) => item.attachmentId)
            .map((item) => item.attachmentId!),
          linkPreview: linkPreview.preview,
          scheduledAt,
          mockMedia: mediaManager.media.flatMap((item) =>
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
        const created = onScheduledSubmit
          ? await onScheduledSubmit(payload)
          : await scheduledPosts.create(payload);

        setContent("");
        mediaManager.clearMedia();
        removeLocation();
        linkPreview.clear();
        closeAllPopups();
        poll.reset();
        setScheduledAt(null);
        return created;
      } finally {
        setIsScheduling(false);
      }
    }

    const created = await submitComposer();
    if (created) {
      setContent("");
      removeLocation();
      linkPreview.clear();
      closeAllPopups();
      poll.reset();
    }
    return created;
  };

  const removePoll = () => {
    poll.reset();
    poll.close();
  };

  const removeLocation = () => {
    setSelectedLocation(null);
  };

  const insertEmoji = (emojiValue: string) => {
    cursor.insertAtCursor(emojiValue, content, setContent);

    closeAllPopups();

    cursor.editorRef.current?.focus();
  };

  const insertGif = (gifItem: Gif) => {
    void mediaManager.addGif(gifItem);

    closeAllPopups();

    cursor.editorRef.current?.focus();
  };

  const insertLocation = (location: Location) => {
    setSelectedLocation(location);

    closeAllPopups();

    cursor.editorRef.current?.focus();
  };

  const popovers = {
    emoji: {
      open: emoji.isOpen,
      reference: buttonRefs.emoji?.current ?? null,
      onOpenChange: (open: boolean) => (open ? emoji.open() : emoji.close()),
      onSelect: insertEmoji,
    },

    gif: {
      open: gif.isOpen,
      reference: buttonRefs.gif?.current ?? null,
      onOpenChange: (open: boolean) => (open ? gif.open() : gif.close()),
      gifs: gif.gifs,
      query: gif.query,
      loading: gif.loading,
      error: gif.error,
      onQueryChange: gif.setQuery,
      onSelect: insertGif,
    },

    poll: {
      open: poll.isOpen,
      reference: buttonRefs.poll?.current ?? null,
      onOpenChange: (open: boolean) => (open ? poll.open() : poll.close()),
      poll: poll.poll,
      onOptionChange: poll.updateOption,
      onAddOption: poll.addOption,
      onRemoveOption: poll.removeOption,
      onDurationChange: poll.setDuration,
    },

    location: {
      open: location.isOpen,
      reference: buttonRefs.location?.current ?? null,
      onOpenChange: (open: boolean) =>
        open ? location.open() : location.close(),
      locations: location.locations,
      query: location.query,
      loading: location.loading,
      error: location.error,
      onQueryChange: location.setQuery,
      onSelect: insertLocation,
    },
  };

  return {
    content,
    setContent,

    remaining,

    canSubmit,
    hasChanges,

    isPosting,

    media: mediaManager.media,
    removeMedia: mediaManager.removeMedia,
    clearMedia: mediaManager.clearMedia,
    onFilesSelected,

    errors: mediaManager.errors,
    clearErrors: mediaManager.clearErrors,

    submit,

    imageInputRef,
    videoInputRef,

    handleAction,

    editorRef: cursor.editorRef,

    buttonRefs,

    popovers,

    disabledActions: [
      ...(!canOpenSchedule ? (["schedule"] as const) : []),
      ...(scheduledAt ? (["poll", "location"] as const) : []),
    ],
    scheduling: {
      enabled: allowScheduling,
      open: schedule.isOpen,
      scheduledAt,
      modalInitialAt: scheduleDraftAt ?? scheduledAt,
      listOpen: isScheduleListOpen,
      submitLabel: scheduleSubmitLabel,
      showScheduledPostsLink,
      canClear: canClearSchedule,
      onOpenChange: (open: boolean) => {
        if (open) schedule.open();
        else {
          schedule.close();
          setScheduleDraftAt(null);
        }
      },
      apply: (value: string) => {
        setScheduledAt(value);
        setScheduleDraftAt(null);
        schedule.close();
      },
      clear: () => {
        setScheduledAt(null);
        setScheduleDraftAt(null);
        schedule.close();
      },
      openList: (draftAt: string) => {
        setScheduleDraftAt(draftAt);
        schedule.close();
        setIsScheduleListOpen(true);
      },
      backToSchedule: () => {
        setIsScheduleListOpen(false);
        schedule.open();
      },
      closeList: () => {
        setIsScheduleListOpen(false);
        setScheduleDraftAt(null);
      },
    },

    pollPreview: {
      visible: poll.hasPoll,
      poll: poll.poll,
      onRemove: removePoll,
    },
    locationPreview: {
      visible: !!selectedLocation,
      location: selectedLocation,
      onRemove: removeLocation,
    },
    linkPreview: {
      visible: linkPreview.loading || !!linkPreview.preview,
      preview: linkPreview.preview,
      loading: linkPreview.loading,
      onRemove: linkPreview.remove,
    },
  };
}
