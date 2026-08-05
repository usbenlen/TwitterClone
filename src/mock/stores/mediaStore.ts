/** @format */

import type { MediaAttachment } from "@/types/media";

const media = new Map<string, MediaAttachment>();

export const mediaStore = {
  add(attachment: MediaAttachment) {
    media.set(attachment.id, attachment);

    return attachment;
  },

  get(id: string) {
    return media.get(id);
  },

  getMany(ids: string[]) {
    return ids.map((id) => media.get(id)).filter(Boolean) as MediaAttachment[];
  },

  remove(id: string) {
    media.delete(id);
  },

  clear() {
    media.clear();
  },
};
