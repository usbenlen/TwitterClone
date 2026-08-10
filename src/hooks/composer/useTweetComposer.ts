/** @format */

import { useMemo, useState } from "react";

import type { Tweet, Gif, Location, Embed } from "@/types";

import { MAX_TWEET_LENGTH, MEDIA_STATUS } from "@/constants/app";

import { useTweetComposerMedia } from "@/hooks/composer/media/useTweetComposerMedia";
import {
  useComposerActions,
  useComposerSubmit,
  useComposerEditor,
} from "@/hooks/composer";

interface UseTweetComposerProps {
  onCreated: (tweet: Tweet) => void;
}

export function useTweetComposer({ onCreated }: UseTweetComposerProps) {
  const [content, setContent] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [selectedEmbed, setSelectedEmbed] = useState<Embed | null>(null);

  const cursor = useComposerEditor();

  const remaining = useMemo(() => MAX_TWEET_LENGTH - content.length, [content]);

  const mediaManager = useTweetComposerMedia();

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
    embed,
  } = useComposerActions();

  const { submit: submitComposer, isPosting } = useComposerSubmit({
    content,
    media: mediaManager.media,
    poll: poll.hasPoll ? poll.poll : null,
    location: selectedLocation,
    embed: selectedEmbed,

    clearMedia: mediaManager.clearMedia,
    clearErrors: mediaManager.clearErrors,

    onCreated,
  });

  const canSubmit =
    (content.trim().length > 0 || mediaManager.media.length > 0) &&
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
      setSelectedEmbed(null);
      closeAllPopups();
      poll.reset();
    }
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

  const insertEmbed = (embedItem: Embed) => {
    setSelectedEmbed(embedItem);

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

    embed: {
      open: embed.isOpen,
      reference: buttonRefs.embed?.current ?? null,
      onOpenChange: (open: boolean) => (open ? embed.open() : embed.close()),
      url: embed.url,
      embed: embed.embed,
      loading: embed.loading,
      error: embed.error,
      onUrlChange: embed.setUrl,
      onResolve: embed.resolve,
      onSelect: insertEmbed,
    },
  };

  return {
    content,
    setContent,

    remaining,

    canSubmit,

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
    embedPreview: {
      visible: !!selectedEmbed,
      embed: selectedEmbed,
      onRemove: () => setSelectedEmbed(null),
    },
  };
}
