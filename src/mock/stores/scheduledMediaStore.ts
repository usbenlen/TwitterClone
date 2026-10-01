import { createIndexedDbStore } from "@/utils/indexedDb";
import type { MediaAttachment, ScheduledMediaInput } from "@/types";

const runTransaction = createIndexedDbStore({
  database: "twitterclone-scheduled-media",
  store: "media",
  version: 1,
  options: { keyPath: "id" },
});

interface StoredMedia {
  id: string;
  blob: Blob;
  type: MediaAttachment["type"];
  mimeType: string;
  sizeInBytes: number;
}

export const scheduledMediaStore = {
  async put(input: ScheduledMediaInput) {
    const record: StoredMedia = {
      id: input.attachmentId,
      blob: input.file,
      type: input.type,
      mimeType: input.file.type,
      sizeInBytes: input.file.size,
    };

    await runTransaction("readwrite", (store) => store.put(record));
  },

  get(id: string) {
    return runTransaction<StoredMedia | undefined>("readonly", (store) =>
      store.get(id),
    );
  },

  async removeMany(ids: string[]) {
    await Promise.all(
      ids.map((id) => runTransaction("readwrite", (store) => store.delete(id))),
    );
  },
};
