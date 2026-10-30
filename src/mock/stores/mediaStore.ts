import type { MediaAttachment } from "@/features/content/types";

const media = new Map<string, MediaAttachment>();

export const mediaStore = {
  add(attachment: MediaAttachment) {
    media.set(attachment.id, attachment);

    return attachment;
  },

  get(id: string) {
    return media.get(id);
  },

  getMany(ids: string[]): MediaAttachment[] {
    return ids
      .map((id) => media.get(id))
      .filter((item): item is MediaAttachment => item !== undefined);
  },

  remove(id: string) {
    media.delete(id);
  },

  clear() {
    media.clear();
  },
};
