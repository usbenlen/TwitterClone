import { useState } from "react";

import { tweetApi } from "@/api/tweet.api";

import type {
  Tweet,
  ComposerMedia,
  ComposerPoll,
  Location,
  Embed,
} from "@/types";

interface UseComposerSubmitProps {
  content: string;
  media: ComposerMedia[];
  poll?: ComposerPoll | null;
  location?: Location | null;
  embed?: Embed | null;

  clearMedia: () => void;
  clearErrors: () => void;

  onCreated: (tweet: Tweet) => void;
}

export function useComposerSubmit({
  content,
  media,
  poll,
  location,
  embed,
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

        mediaIds: media
          .filter((item) => item.attachmentId)
          .map((item) => item.attachmentId!),

        poll:
          poll && poll.options.some((o) => o.text.trim())
            ? {
                options: poll.options.map((o) => o.text.trim()).filter(Boolean),
                duration: poll.duration,
              }
            : undefined,

        location,
        embed,
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
