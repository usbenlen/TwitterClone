/** @format */

import { useMemo, useState, useRef } from "react";

import { tweetApi } from "@/api/tweet.api";

import type { Tweet } from "@/types/tweet";
import type { ComposerAction } from "@/types/composer";

import { MAX_TWEET_LENGTH, MEDIA_STATUS } from "@/constants/app";

import { useTweetComposerMedia } from "@/hooks/composer/media/useTweetComposerMedia";

interface UseTweetComposerProps {
  onCreated: (tweet: Tweet) => void;
}

export function useTweetComposer({ onCreated }: UseTweetComposerProps) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const remaining = useMemo(() => MAX_TWEET_LENGTH - content.length, [content]);

  const mediaManager = useTweetComposerMedia();

  const hasBlockedMedia = mediaManager.media.some(
    (item) =>
      item.status === MEDIA_STATUS.UPLOADING ||
      item.status === MEDIA_STATUS.COMPRESSING ||
      item.status === MEDIA_STATUS.ERROR,
  );

  const canSubmit =
    (content.trim().length > 0 || mediaManager.media.length > 0) &&
    remaining >= 0 &&
    !isPosting &&
    !hasBlockedMedia;

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const onFilesSelected = (files: FileList | null) => {
    mediaManager.addFiles(files);
  };

  const submit = async () => {
    if (!canSubmit) return;

    setIsPosting(true);

    try {
      const attachmentIds = mediaManager.media
        .filter((item) => item.attachmentId)
        .map((item) => item.attachmentId!);

      const tweet = await tweetApi.create({
        content: content.trim(),
        attachmentIds,
      });

      onCreated(tweet);

      setContent("");
      mediaManager.clearMedia();
      mediaManager.clearErrors();
    } finally {
      setIsPosting(false);
    }
  };

  const handleAction = (action: ComposerAction) => {
    switch (action) {
      case "image":
        imageInputRef.current?.click();
        break;

      case "video":
        videoInputRef.current?.click();
        break;

      case "gif":
        console.log("GIF picker");
        break;

      case "emoji":
        console.log("Emoji picker");
        break;

      case "poll":
        console.log("Poll");
        break;

      case "location":
        console.log("Location");
        break;
    }
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
  };
}
