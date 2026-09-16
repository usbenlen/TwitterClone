import { useMemo, useState } from "react";

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
} from "@/types";

interface UseTweetComposerProps {
  initialContent?: string;
  initialMedia?: ComposerMedia[];
  initialPoll?: ComposerPoll | null;
  initialLocation?: Location | null;
  initialLinkPreview?: LinkPreview | null;
  allowEmptySubmit?: boolean;
  onCreated?: (tweet: Tweet) => void;
  onSubmit?: (data: ComposerSubmitData) => Promise<unknown>;
}

export function useTweetComposer({
  initialContent = "",
  initialMedia = [],
  initialPoll = null,
  initialLocation = null,
  initialLinkPreview = null,
  allowEmptySubmit = false,
  onCreated,
  onSubmit,
}: UseTweetComposerProps = {}) {
  const [content, setContent] = useState(initialContent);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation,
  );
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
  } = useComposerActions(initialPoll);

  const { submit: submitComposer, isPosting } = useComposerSubmit({
    content,
    media: mediaManager.media,
    poll: poll.hasPoll ? poll.poll : null,
    location: selectedLocation,
    linkPreview: linkPreview.preview,

    clearMedia: mediaManager.clearMedia,
    clearErrors: mediaManager.clearErrors,

    onCreated: onCreated || (() => {}),
    onSubmit,
  });

  const hasChanges =
    content.trim().length > 0 ||
    mediaManager.media.length > 0 ||
    poll.hasPoll ||
    selectedLocation !== null ||
    linkPreview.preview !== initialLinkPreview;

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
    !hasBlockedMedia;

  const onFilesSelected = (files: FileList | null) => {
    mediaManager.addFiles(files);
  };

  const submit = async () => {
    if (!canSubmit) return;

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
