/** @format */

import { useState } from "react";

import { tweetApi } from "@/api/tweet.api";

import type { Tweet } from "@/types/tweet";
import type { ComposerMedia } from "@/types/composer";

interface UseComposerSubmitProps {
  content: string;
  media: ComposerMedia[];

  clearMedia: () => void;
  clearErrors: () => void;

  onCreated: (tweet: Tweet) => void;
}

export function useComposerSubmit({
  content,
  media,
  clearMedia,
  clearErrors,
  onCreated,
}: UseComposerSubmitProps) {
  const [isPosting, setIsPosting] = useState(false);

  const submit = async () => {
    setIsPosting(true);

    try {
      const tweet = await tweetApi.create({
        content: content.trim(),

        media: media.map((item) => ({
          type: item.type,
          attachmentId: item.attachmentId,
          url: item.url,
        })),
      });

      onCreated(tweet);

      clearMedia();
      clearErrors();

      return true;
    } finally {
      setIsPosting(false);
    }
  };

  return {
    submit,
    isPosting,
  };
}
