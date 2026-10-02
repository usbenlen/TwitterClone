import { useMemo, useRef, useState } from "react";
import { useComposerScheduling } from "@/hooks/composer/useComposerScheduling";
import {
  canScheduleMedia,
  getComposerError,
  getComposerRulesError,
  hasComposerChanges,
} from "@/utils/composer";
import {
  countCharacters,
  getDisabledComposerActions,
  getPollError,
} from "@/utils/composerRules";

import {
  useComposerActions,
  useComposerSubmit,
  useComposerEditor,
  useTweetComposerMedia,
  useComposerLinkPreview,
} from "@/hooks/composer";

import { MAX_TWEET_LENGTH } from "@/constants/app";

import type {
  Gif,
  Location,
  LinkPreview,
  ComposerMedia,
  ComposerPoll,
  Tweet,
  ComposerSubmitData,
  UpdateScheduledPostRequest,
  ComposerAction,
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
  const locationRef = useRef<Location | null>(initialLocation);
  const submittingRef = useRef(false);
  const cursor = useComposerEditor();
  const linkPreview = useComposerLinkPreview(content, initialLinkPreview);

  const remaining = useMemo(
    () => MAX_TWEET_LENGTH - countCharacters(content),
    [content],
  );

  const mediaManager = useTweetComposerMedia(initialMedia);

  const hasBlockedMedia = mediaManager.media.some(
    (item) => item.status !== "uploaded" || !item.attachmentId,
  );

  const {
    imageInputRef,
    videoInputRef,
    handleAction: performAction,
    closeAllPopups,

    buttonRefs,

    emoji,
    gif,
    poll,
    location,
    schedule,
  } = useComposerActions(initialPoll);

  const scheduleState = useComposerScheduling({
    popup: schedule,
    initialScheduledAt,
    enabled: allowScheduling,
    submitLabel: scheduleSubmitLabel,
    showScheduledPostsLink,
    canClear: canClearSchedule,
    onSubmit: onScheduledSubmit,
  });
  const { scheduledAt, isScheduling } = scheduleState;

  const { submit: submitComposer, isPosting: isPostingNow } = useComposerSubmit(
    {
      content,
      media: mediaManager.media,
      poll: poll.isActive ? poll.poll : null,
      location: selectedLocation,
      linkPreview: linkPreview.preview,

      clearMedia: mediaManager.clearMedia,
      clearErrors: mediaManager.clearErrors,

      onCreated,
      onSubmit,
    },
  );

  const isPosting = isPostingNow || isScheduling;

  const getLiveValues = () => ({
    content,
    media: mediaManager.getMedia(),
    poll: poll.getIsActive() ? poll.poll : null,
    location: locationRef.current,
    linkPreview: linkPreview.preview,
    scheduledAt,
  });

  const getDisabledActions = () => {
    const values = getLiveValues();
    return getDisabledComposerActions({
      media: values.media,
      hasPoll: Boolean(values.poll),
      hasLocation: Boolean(values.location),
      scheduled: Boolean(scheduledAt),
      canSchedule: canOpenSchedule && canScheduleMedia(values.media),
      busy: isPosting || submittingRef.current,
    });
  };

  const handleAction = (action: ComposerAction) => {
    if (getDisabledActions().includes(action)) return;
    performAction(action);
  };

  const hasScheduleCompatibleMedia = canScheduleMedia(mediaManager.media);

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
    !poll.isActive &&
    selectedLocation === null &&
    hasScheduleCompatibleMedia;

  const hasChanges = hasComposerChanges(
    {
      content,
      media: mediaManager.media,
      poll: poll.isActive ? poll.poll : null,
      location: selectedLocation,
      linkPreview: linkPreview.preview,
      scheduledAt,
    },
    {
      content: initialContent,
      media: initialMedia,
      poll: initialPoll,
      location: initialLocation,
      linkPreview: initialLinkPreview,
      scheduledAt: initialScheduledAt,
    },
  );

  const values = {
    content,
    media: mediaManager.media,
    poll: poll.isActive ? poll.poll : null,
    location: selectedLocation,
    scheduledAt,
  };
  const validationError = getComposerError(values);
  const rulesError = getComposerRulesError(values);
  const inlinePollError = poll.isActive
    ? getPollError(
        poll.poll.options.map((option) => option.text),
        poll.poll.duration,
      )
    : null;

  const canSubmit =
    (allowEmptySubmit ||
      Boolean(
        content.trim().length > 0 ||
        mediaManager.media.length > 0 ||
        poll.isActive ||
        selectedLocation ||
        linkPreview.preview,
      )) &&
    (!poll.isActive || poll.isValid) &&
    validationError === null &&
    remaining >= 0 &&
    !isPosting &&
    !hasBlockedMedia &&
    (!scheduledAt || canOpenSchedule);

  const onFilesSelected = (files: FileList | null) => {
    if (isPosting || submittingRef.current) return;
    if (poll.getIsActive()) {
      mediaManager.pushError("Медіа та опитування не можна поєднувати.");
      return;
    }
    void mediaManager.addFiles(files);
  };

  const resetComposer = () => {
    setContent("");
    removeLocation();
    linkPreview.clear();
    closeAllPopups();
    poll.reset();
  };
  const submit = async () => {
    const values = getLiveValues();
    if (!canSubmit || submittingRef.current || getComposerError(values)) return;
    if (
      !allowEmptySubmit &&
      !values.content.trim() &&
      !values.media.length &&
      !values.poll &&
      !values.location &&
      !values.linkPreview
    )
      return;
    submittingRef.current = true;
    try {
      if (scheduledAt && allowScheduling) {
        const created = await scheduleState.submit({
          ...getLiveValues(),
          linkPreview: linkPreview.preview,
        });
        if (created === false || created === undefined) return created;
        mediaManager.clearMedia();
        resetComposer();
        scheduleState.reset();
        return created;
      }
      const created = await submitComposer(values);
      if (created) resetComposer();
      return created;
    } finally {
      submittingRef.current = false;
    }
  };

  const removePoll = () => {
    if (isPosting || submittingRef.current) return;
    poll.reset();
    if (mediaManager.getMedia().length === 0) mediaManager.clearErrors();
    buttonRefs.poll?.current?.focus();
  };

  const removeLocation = () => {
    locationRef.current = null;
    setSelectedLocation(null);
  };

  const insertEmoji = (emojiValue: string) => {
    if (getDisabledActions().includes("emoji")) return;
    cursor.insertAtCursor(emojiValue, content, setContent);

    closeAllPopups();

    cursor.editorRef.current?.focus();
  };

  const insertGif = (gifItem: Gif) => {
    if (getDisabledActions().includes("gif")) return;
    void mediaManager.addGif(gifItem);

    closeAllPopups();

    cursor.editorRef.current?.focus();
  };

  const insertLocation = (location: Location) => {
    if (getDisabledActions().includes("location")) return;
    locationRef.current = location;
    setSelectedLocation(location);

    closeAllPopups();

    cursor.editorRef.current?.focus();
  };

  const changePopup = (
    action: ComposerAction,
    popup: { open: () => void; close: () => void },
    open: boolean,
  ) => {
    if (!open) popup.close();
    else if (!getDisabledActions().includes(action)) popup.open();
  };

  const popovers = {
    emoji: {
      open: emoji.isOpen,
      reference: buttonRefs.emoji?.current ?? null,
      onOpenChange: (open: boolean) => changePopup("emoji", emoji, open),
      onSelect: insertEmoji,
    },

    gif: {
      open: gif.isOpen,
      reference: buttonRefs.gif?.current ?? null,
      onOpenChange: (open: boolean) => changePopup("gif", gif, open),
      gifs: gif.gifs,
      query: gif.query,
      loading: gif.loading,
      error: gif.error,
      onQueryChange: gif.setQuery,
      onSelect: insertGif,
    },

    location: {
      open: location.isOpen,
      reference: buttonRefs.location?.current ?? null,
      onOpenChange: (open: boolean) => changePopup("location", location, open),
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
    setContent: (value: string) => {
      if (!isPosting && !submittingRef.current) setContent(value);
    },

    remaining,

    canSubmit,
    hasChanges,

    isPosting,

    media: mediaManager.media,
    removeMedia: (id: string) => {
      if (!isPosting && !submittingRef.current) mediaManager.removeMedia(id);
    },
    clearMedia: () => {
      if (!isPosting && !submittingRef.current) mediaManager.clearMedia();
    },
    onFilesSelected,

    errors: [
      ...mediaManager.errors,
      ...(rulesError && rulesError !== inlinePollError
        ? [{ id: "composer-rules", message: rulesError }]
        : []),
    ],
    clearErrors: mediaManager.clearErrors,

    submit,

    imageInputRef,
    videoInputRef,

    handleAction,

    editorRef: cursor.editorRef,

    buttonRefs,

    popovers,

    disabledActions: getDisabledComposerActions({
      media: mediaManager.media,
      hasPoll: poll.isActive,
      hasLocation: selectedLocation !== null,
      scheduled: Boolean(scheduledAt),
      canSchedule: canOpenSchedule,
      busy: isPosting,
    }),
    scheduling: {
      ...scheduleState.scheduling,
      onOpenChange: (open: boolean) => {
        if (!open || !getDisabledActions().includes("schedule"))
          scheduleState.scheduling.onOpenChange(open);
      },
      apply: (value: string) => {
        if (!getDisabledActions().includes("schedule"))
          scheduleState.scheduling.apply(value);
      },
      clear: () => {
        if (!isPosting && !submittingRef.current)
          scheduleState.scheduling.clear();
      },
    },

    pollEditor: {
      visible: poll.isActive,
      poll: poll.poll,
      isValid: poll.isValid,
      disabled: isPosting,
      firstOptionRef: poll.firstOptionRef,
      onOptionChange: (id: string, text: string) => {
        if (!isPosting && !submittingRef.current) poll.updateOption(id, text);
      },
      onAddOption: () => {
        if (!isPosting && !submittingRef.current) poll.addOption();
      },
      onRemoveOption: (id: string) => {
        if (!isPosting && !submittingRef.current) poll.removeOption(id);
      },
      onDurationChange: (minutes: number) => {
        if (!isPosting && !submittingRef.current) poll.setDuration(minutes);
      },
      onRemove: removePoll,
    },
    locationPreview: {
      visible: !!selectedLocation,
      location: selectedLocation,
      onRemove: () => {
        if (!isPosting && !submittingRef.current) removeLocation();
      },
    },
    linkPreview: {
      visible: linkPreview.loading || !!linkPreview.preview,
      preview: linkPreview.preview,
      loading: linkPreview.loading,
      onRemove: () => {
        if (!isPosting && !submittingRef.current) linkPreview.remove();
      },
    },
  };
}
