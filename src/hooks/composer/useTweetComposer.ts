/** @format */

import { useMemo, useState } from "react";

import type { Tweet } from "@/types/tweet";

import { MAX_TWEET_LENGTH, MEDIA_STATUS } from "@/constants/app";

import { useTweetComposerMedia } from "@/hooks/composer/media/useTweetComposerMedia";
import { useComposerActions, useComposerSubmit } from "@/hooks/composer";

interface UseTweetComposerProps {
  onCreated: (tweet: Tweet) => void;
}

export function useTweetComposer({ onCreated }: UseTweetComposerProps) {
  const [content, setContent] = useState("");

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
    if (created) setContent("");
  };

  const { imageInputRef, videoInputRef, handleAction } = useComposerActions();

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
  };
}
