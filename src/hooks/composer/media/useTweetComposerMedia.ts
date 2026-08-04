/** @format */

import { useState } from "react";

import { MEDIA } from "@/constants/app";

import type {
  ComposerMedia,
  ComposerMediaError,
  ComposerMediaStatus,
} from "@/types/composer";

import { prepareMedia } from "@/utils/media";

import { useMediaUpload } from "@/hooks/composer/media";

export function useTweetComposerMedia() {
  const [media, setMedia] = useState<ComposerMedia[]>([]);
  const [errors, setErrors] = useState<ComposerMediaError[]>([]);

  const updateMedia = (
    id: string,
    updater: (item: ComposerMedia) => ComposerMedia,
  ) => {
    setMedia((current) =>
      current.map((item) => (item.id === id ? updater(item) : item)),
    );
  };

  const setStatus = (id: string, status: ComposerMediaStatus) => {
    updateMedia(id, (item) => ({
      ...item,
      status,
    }));
  };

  const setProgress = (id: string, progress: number) => {
    updateMedia(id, (item) => ({
      ...item,
      progress,
    }));
  };

  const pushError = (message: string) => {
    setErrors((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        message,
      },
    ]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const setAttachmentId = (id: string, attachmentId: string) => {
    updateMedia(id, (item) => ({
      ...item,
      attachmentId,
    }));
  };

  const { upload } = useMediaUpload({
    setStatus,
    setProgress,
    setAttachmentId,
    pushError,
  });

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    clearErrors();

    const added: ComposerMedia[] = [];

    for (const file of Array.from(files)) {
      if (media.length + added.length >= MEDIA.MAX_ATTACHMENTS) {
        pushError(`Максимум ${MEDIA.MAX_ATTACHMENTS} вкладень.`);
        break;
      }

      const prepared = await prepareMedia(file);

      if (!prepared.success) {
        pushError(prepared.message);
        continue;
      }

      added.push(prepared.media);
    }

    if (added.length === 0) return;

    setMedia((current) => [...current, ...added]);

    for (const item of added) upload(item);
  };

  const removeMedia = (id: string) => {
    setMedia((current) => {
      const item = current.find((m) => m.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);

      const next = current.filter((m) => m.id !== id);
      if (next.length === 0) clearErrors();

      return next;
    });
  };

  const clearMedia = () => {
    media.forEach((item) => URL.revokeObjectURL(item.previewUrl));

    setMedia([]);
    clearErrors();
  };

  return {
    media,
    errors,

    addFiles,
    removeMedia,
    clearMedia,
    clearErrors,

    updateMedia,
    setStatus,
    setProgress,
  };
}
