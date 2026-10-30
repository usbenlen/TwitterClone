import { useState } from "react";

import { buildComposerPayload } from "@/utils/composer/composerPayload";

import type {
  ComposerValues,
  Post,
  ComposerMedia,
  ComposerSubmitData,
  ComposerPoll,
  Location,
  LinkPreview,
} from "@/types";

import { useCreatePostMutation } from "@/store/posts/postQueries";

interface UseComposerSubmitProps {
  content: string;
  media: ComposerMedia[];
  poll?: ComposerPoll | null;
  location?: Location | null;
  linkPreview?: LinkPreview | null;

  clearMedia: () => void;
  clearErrors: () => void;

  onCreated?: (post: Post) => void;
  onSubmit?: (data: ComposerSubmitData) => Promise<unknown>;
}

export function useComposerSubmit({
  content,
  media,
  poll,
  location,
  linkPreview,
  clearMedia,
  clearErrors,
  onCreated,
  onSubmit,
}: UseComposerSubmitProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [createPost] = useCreatePostMutation();

  const submit = async (values?: ComposerValues) => {
    setIsPosting(true);

    try {
      const payload = buildComposerPayload(
        values ?? {
          content,
          media,
          poll,
          location,
          linkPreview,
        },
      );

      let result;
      if (onSubmit) result = await onSubmit(payload);
      else {
        result = await createPost({
          content: payload.content,
          mediaIds: payload.mediaIds,
          poll: payload.poll || undefined,
          location: payload.location,
          linkPreview: payload.linkPreview,
        }).unwrap();
      }

      if (result && typeof result === "object") onCreated?.(result as Post);

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
