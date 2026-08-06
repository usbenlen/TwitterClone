/** @format */

import { useState } from "react";

import { tweetApi } from "@/api/tweet.api";

import type { Tweet } from "@/types/tweet";
import type { ComposerMedia } from "@/types/composer";
import type { ComposerPoll } from "@/types/poll";

interface UseComposerSubmitProps {
  content: string;
  media: ComposerMedia[];
  poll?: ComposerPoll | null;

  clearMedia: () => void;
  clearErrors: () => void;

  onCreated: (tweet: Tweet) => void;
}

export function useComposerSubmit({
  content,
  media,
  poll,
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

        poll:
          poll && poll.options.some((o) => o.text.trim())
            ? {
                options: poll.options.map((o) => o.text.trim()).filter(Boolean),
                duration: poll.duration,
              }
            : undefined,
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
