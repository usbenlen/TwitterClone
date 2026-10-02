import { mediaApi } from "@/api";

import { MEDIA_STATUS } from "@/constants/app";

import type { ComposerMedia, ComposerMediaStatus } from "@/types/composer";

interface UseMediaUploadProps {
  setStatus: (id: string, status: ComposerMediaStatus) => void;
  setProgress: (id: string, progress: number) => void;
  setAttachmentId: (id: string, attachmentId: string) => void;
  pushError: (message: string) => void;
  isActive: (id: string) => boolean;
}

export function useMediaUpload({
  setStatus,
  setProgress,
  setAttachmentId,
  pushError,
  isActive,
}: UseMediaUploadProps) {
  const upload = async (item: ComposerMedia) => {
    if (!isActive(item.id)) return null;
    if (!item.file) {
      setStatus(item.id, MEDIA_STATUS.ERROR);
      pushError(`Файл "${item.name}" відсутній.`);
      return null;
    }

    setStatus(item.id, MEDIA_STATUS.UPLOADING);

    try {
      const attachment = await mediaApi.upload(item.file, {
        onProgress(progress) {
          if (isActive(item.id)) setProgress(item.id, progress);
        },
      });

      if (!isActive(item.id)) return null;

      setAttachmentId(item.id, attachment.id);
      setProgress(item.id, 100);
      setStatus(item.id, MEDIA_STATUS.UPLOADED);

      return attachment;
    } catch {
      if (!isActive(item.id)) return null;
      setStatus(item.id, MEDIA_STATUS.ERROR);

      pushError(`Не вдалося завантажити "${item.name}".`);

      return null;
    }
  };

  return {
    upload,
  };
}
