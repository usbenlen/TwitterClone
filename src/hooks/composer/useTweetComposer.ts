/** @format */

import { useMemo, useState } from "react";

import type { Tweet } from "@/types/tweet";

import { MAX_TWEET_LENGTH, MEDIA_STATUS } from "@/constants/app";

import { useTweetComposerMedia } from "@/hooks/composer/media/useTweetComposerMedia";
import {
  useComposerActions,
  useComposerSubmit,
  useComposerCursor,
} from "@/hooks/composer";

interface UseTweetComposerProps {
  onCreated: (tweet: Tweet) => void;
}

export function useTweetComposer({ onCreated }: UseTweetComposerProps) {
  const [content, setContent] = useState("");
  const cursor = useComposerCursor();

  const remaining = useMemo(() => MAX_TWEET_LENGTH - content.length, [content]);

  const mediaManager = useTweetComposerMedia();

  const hasBlockedMedia = mediaManager.media.some(
    (item) =>
      item.status === MEDIA_STATUS.UPLOADING ||
      item.status === MEDIA_STATUS.COMPRESSING ||
      item.status === MEDIA_STATUS.ERROR,
  );

  const { submit: submitComposer, isPosting } = useComposerSubmit({
    content,

    media: mediaManager.media,

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
      emoji.close();
    }
  };

  const { imageInputRef, videoInputRef, handleAction, emoji, buttonRefs } =
    useComposerActions();

  const insertEmoji = (emojiValue: string) => {
    cursor.insertAtCursor(emojiValue, content, setContent);

    emoji.close();

    cursor.editorRef.current?.focus();
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

    emoji: {
      open: emoji.open,
      reference: buttonRefs.emoji?.current ?? null,
      onOpenChange: (value: boolean) => {
        if (value) {
          emoji.toggle();
        } else {
          emoji.close();
        }
      },
      onSelect: insertEmoji,
    },
  };
}
