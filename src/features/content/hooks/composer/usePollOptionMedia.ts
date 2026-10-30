import { useContext, useEffect, useRef, useState } from "react";
import { ReactReduxContext } from "react-redux";

import { mediaApi } from "@/features/content/api";
import { createPreview } from "@/features/content/lib/media/createPreview";
import { prepareMedia } from "@/features/content/lib/media/prepareMedia";
import { validateMedia } from "@/features/content/lib/media/validateMedia";
import { ENABLE_IMAGE_UPLOAD } from "@/shared/config/featureFlags";
import { sessionGeneration } from "@/shared/store/session";

import type { ComposerMedia, PollOption } from "@/features/content/types";

interface PollOptionMediaProps {
  getOption: (id: string) => PollOption | undefined;
  updateImage: (id: string, image?: ComposerMedia) => void;
}

export function usePollOptionMedia({
  getOption,
  updateImage,
}: PollOptionMediaProps) {
  const context = useContext(ReactReduxContext);
  const ownedUrls = useRef(new Set<string>());
  const mounted = useRef(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const generation = () => context ? sessionGeneration(context.store.getState()) : 0;

  const revoke = (url?: string) => {
    if (url && ownedUrls.current.delete(url)) URL.revokeObjectURL(url);
  };

  useEffect(() => {
    mounted.current = true;
    const urls = ownedUrls.current;
    return () => {
      mounted.current = false;
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const clearError = (id: string) => {
    setErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const remove = (id: string) => {
    revoke(getOption(id)?.image?.previewUrl);
    updateImage(id);
    clearError(id);
  };

  const clear = () => {
    ownedUrls.current.forEach((url) => URL.revokeObjectURL(url));
    ownedUrls.current.clear();
    setErrors({});
  };

  const select = async (id: string, file: File) => {
    if (!ENABLE_IMAGE_UPLOAD || !getOption(id)) return;

    const validation = validateMedia(file);
    if (!validation.valid || validation.type !== "image") {
      setErrors((current) => ({
        ...current,
        [id]: validation.valid
          ? "Оберіть фото у форматі JPEG, PNG або WebP."
          : validation.message,
      }));
      return;
    }

    clearError(id);
    const requestGeneration = generation();
    const previousUrl = getOption(id)?.image?.previewUrl;
    const reserved = {
      ...createPreview(file, "image"),
      status: "compressing" as const,
    };
    ownedUrls.current.add(reserved.previewUrl);
    updateImage(id, reserved);
    revoke(previousUrl);

    const isActive = () =>
      mounted.current &&
      generation() === requestGeneration &&
      getOption(id)?.image?.id === reserved.id;

    const update = (changes: Partial<ComposerMedia>) => {
      if (isActive()) updateImage(id, { ...getOption(id)!.image!, ...changes });
    };

    try {
      const prepared = await prepareMedia(file);
      if (!prepared.success) throw new Error(prepared.message);

      ownedUrls.current.add(prepared.media.previewUrl);

      if (!isActive()) {
        revoke(prepared.media.previewUrl);
        return;
      }

      revoke(reserved.previewUrl);
      update({ ...prepared.media, id: reserved.id, status: "uploading" });

      const attachment = await mediaApi.upload(prepared.media.file!, {
        onProgress: (progress) => update({ progress }),
      });

      update({
        attachmentId: attachment.id,
        url: attachment.url,
        status: "uploaded",
        progress: 100,
      });
    } catch (error) {
      if (!isActive()) return;

      update({ status: "error" });

      setErrors((current) => ({
        ...current,
        [id]:
          error instanceof Error
            ? error.message
            : "Не вдалося завантажити фото.",
      }));
    }
  };

  const retry = (id: string) => {
    const file = getOption(id)?.image?.file;
    if (file) return select(id, file);
  };

  return { errors, select, remove, retry, clear };
}
