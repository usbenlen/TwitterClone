/** @format */

import { MEDIA_STATUS } from "@/constants/app";

import type { ComposerMedia, ComposerMediaStatus } from "@/types/composer";

import { mediaApi } from "@/api";

interface UseMediaUploadProps {
  setStatus: (id: string, status: ComposerMediaStatus) => void;
  setProgress: (id: string, progress: number) => void;
  setAttachmentId: (id: string, attachmentId: string) => void;
  pushError: (message: string) => void;
}

export function useMediaUpload({
  setStatus,
  setProgress,
  setAttachmentId,
  pushError,
}: UseMediaUploadProps) {
  const upload = async (item: ComposerMedia) => {
    if (!item.file) {
      setStatus(item.id, MEDIA_STATUS.ERROR);
      pushError(`Файл "${item.name}" відсутній.`);
      return null;
    }

    setStatus(item.id, MEDIA_STATUS.UPLOADING);

    try {
      const attachment = await mediaApi.upload(item.file, {
        onProgress(progress) {
          setProgress(item.id, progress);
        },
      });

      setAttachmentId(item.id, attachment.id);
      setProgress(item.id, 100);
      setStatus(item.id, MEDIA_STATUS.UPLOADED);

      return attachment;
    } catch {
      setStatus(item.id, MEDIA_STATUS.ERROR);

      pushError(`Не вдалося завантажити "${item.name}".`);

      return null;
    }
  };

  return {
    upload,
  };
}
