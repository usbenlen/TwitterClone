import { useEffect, useRef, useState } from "react";

import { useMediaUpload } from "@/hooks/composer/useMediaUpload";

import { BYTES_PER_MEGABYTE, MEDIA } from "@/constants/media";

import { prepareMedia } from "@/utils/media/prepareMedia";
import { createPreview } from "@/utils/media/createPreview";
import { validateMedia } from "@/utils/media/validateMedia";
import { getMediaAdditionError } from "@/utils/composer/composerRules";

import type {
  ComposerMedia,
  ComposerMediaError,
  ComposerMediaStatus,
  Gif,
} from "@/types";

export function usePostComposerMedia(initialMedia?: ComposerMedia[]) {
  const [media, setMedia] = useState<ComposerMedia[]>(initialMedia ?? []);
  // Reservations are synchronous, including between renders and async preparation.
  const currentMedia = useRef<ComposerMedia[]>(initialMedia ?? []);
  const ownedPreviewUrls = useRef(new Set<string>());
  const [errors, setErrors] = useState<ComposerMediaError[]>([]);

  const ownPreviewUrl = (url: string) => {
    ownedPreviewUrls.current.add(url);
  };

  const revokeOwnedPreviewUrl = (url: string) => {
    if (!ownedPreviewUrls.current.delete(url)) return;
    URL.revokeObjectURL(url);
  };

  useEffect(
    () => () => {
      ownedPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      ownedPreviewUrls.current.clear();
      currentMedia.current = [];
    },
    [],
  );

  const commitMedia = (next: ComposerMedia[]) => {
    currentMedia.current = next;
    setMedia(next);
  };

  const hasMedia = (id: string) =>
    currentMedia.current.some((item) => item.id === id);

  const updateMedia = (
    id: string,
    updater: (item: ComposerMedia) => ComposerMedia,
  ) => {
    commitMedia(
      currentMedia.current.map((item) =>
        item.id === id ? updater(item) : item,
      ),
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
    isActive: hasMedia,
  });

  const createGifFile = async (gif: Gif): Promise<File> => {
    const response = await fetch(gif.originalUrl);

    if (!response.ok)
      throw new Error(`Failed to download GIF: ${response.status}`);

    const blob = await response.blob();
    const file = new File([blob], `${gif.id}.gif`, {
      type: "image/gif",
    });

    const maxSizeBytes = MEDIA.GIF.MAX_SIZE_MB * BYTES_PER_MEGABYTE;

    if (file.size > maxSizeBytes)
      throw new Error(`GIF exceeds ${MEDIA.GIF.MAX_SIZE_MB} MB.`);

    return file;
  };

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    clearErrors();

    const reserved: ComposerMedia[] = [];

    for (const file of Array.from(files)) {
      const validation = validateMedia(file);
      if (!validation.valid) {
        pushError(validation.message);
        continue;
      }
      const error = getMediaAdditionError(
        currentMedia.current,
        validation.type,
      );
      if (error) {
        pushError(`"${file.name}": ${error}`);
        continue;
      }
      const item = {
        ...createPreview(file, validation.type),
        status: "compressing" as const,
      };
      ownPreviewUrl(item.previewUrl);
      commitMedia([...currentMedia.current, item]);
      reserved.push(item);
    }

    await Promise.all(
      reserved.map(async (item) => {
        try {
          const prepared = await prepareMedia(item.file!);
          if (!prepared.success) throw new Error(prepared.message);
          ownPreviewUrl(prepared.media.previewUrl);
          if (!hasMedia(item.id)) {
            revokeOwnedPreviewUrl(prepared.media.previewUrl);
            return;
          }
          revokeOwnedPreviewUrl(item.previewUrl);
          const ready = { ...prepared.media, id: item.id };
          updateMedia(item.id, () => ready);
          await upload(ready);
        } catch (error) {
          if (!hasMedia(item.id)) return;
          setStatus(item.id, "error");
          pushError(
            error instanceof Error
              ? error.message
              : `Не вдалося підготувати "${item.name}".`,
          );
        }
      }),
    );
  };

  const addGif = async (gif: Gif) => {
    clearErrors();

    const error = getMediaAdditionError(currentMedia.current, "gif");
    if (error) {
      pushError(error);
      return;
    }

    const id = crypto.randomUUID();
    commitMedia([
      ...currentMedia.current,
      {
        id,
        type: "gif",
        url: gif.originalUrl,
        previewUrl: gif.previewUrl,
        width: gif.width,
        height: gif.height,
        name: gif.title,
        size: 0,
        progress: 0,
        status: "compressing",
      },
    ]);

    try {
      const file = await createGifFile(gif);
      if (!hasMedia(id)) return;

      const item: ComposerMedia = {
        id,
        file,
        type: "gif",
        url: gif.originalUrl,
        previewUrl: gif.previewUrl,
        width: gif.width,
        height: gif.height,
        name: gif.title,
        size: file.size,
        progress: 0,
        status: "ready",
      };

      updateMedia(id, () => item);
      await upload(item);
    } catch {
      if (!hasMedia(id)) return;
      setStatus(id, "error");
      pushError(`Не вдалося підготувати GIF "${gif.title}".`);
    }
  };

  const removeMedia = (id: string) => {
    const item = currentMedia.current.find((m) => m.id === id);
    if (item) revokeOwnedPreviewUrl(item.previewUrl);
    const next = currentMedia.current.filter((m) => m.id !== id);
    commitMedia(next);
    if (next.length === 0) clearErrors();
  };

  const clearMedia = () => {
    ownedPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    ownedPreviewUrls.current.clear();

    commitMedia([]);
    clearErrors();
  };

  return {
    media,
    getMedia: () => currentMedia.current,
    errors,

    addFiles,
    addGif,

    removeMedia,
    clearMedia,
    clearErrors,
    pushError,

    updateMedia,
    setStatus,
    setProgress,
  };
}
