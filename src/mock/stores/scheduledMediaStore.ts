import type { MediaAttachment, ScheduledMediaInput } from "@/types";

const DB_NAME = "twitterclone-scheduled-media";
const STORE_NAME = "media";
const DB_VERSION = 1;

interface StoredMedia {
  id: string;
  blob: Blob;
  type: MediaAttachment["type"];
  mimeType: string;
  sizeInBytes: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME))
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error);
  });
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
