import { useState } from "react";

import { tweetApi } from "@/api/tweet.api";

import type {
  Tweet,
  ComposerMedia,
  ComposerPoll,
  Location,
  Embed,
  ComposerSubmitData,
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
  onSubmit?: (data: ComposerSubmitData) => Promise<unknown>;
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
  onSubmit,
}: UseComposerSubmitProps) {
  const [isPosting, setIsPosting] = useState(false);

  const submit = async () => {
    setIsPosting(true);

    try {
      const pollData =
        poll && poll.options.some((o) => o.text.trim())
          ? {
              options: poll.options.map((o) => o.text.trim()).filter(Boolean),
              duration: poll.duration,
            }
          : poll === null
            ? null
            : undefined;

      const payload = {
        content: content.trim(),
        mediaIds: media
          .filter((item) => item.attachmentId)
          .map((item) => item.attachmentId!),
        poll: pollData,
        location,
        embed,
      };

      let result;
      if (onSubmit) result = await onSubmit(payload);
      else {
        result = await tweetApi.create({
          content: payload.content,
          mediaIds: payload.mediaIds,
          poll: pollData || undefined,
          location: payload.location,
          embed: payload.embed,
        });
      }

      if (result && typeof result === "object") onCreated(result as Tweet);

      if (result !== false) {
        clearMedia();
        clearErrors();
      }

      return result ?? true;
    } finally {
      setIsPosting(false);
    }
  };

  return {
    submit,
    isPosting,
  };
}
