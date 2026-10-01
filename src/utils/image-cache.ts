import { createIndexedDbStore } from "@/utils/indexedDb";

const transaction = createIndexedDbStore({
  database: "tc_image_cache",
  store: "images",
  version: 1,
});
interface PendingImage {
  promise: Promise<Blob | null>;
  invalidated: boolean;
}
const pending = new Map<string, PendingImage>();

export const imageCache = {
  async get(url: string): Promise<Blob | null> {
    try {
      const result = await transaction<unknown>("readonly", (store) =>
        store.get(url),
      );
      return result instanceof Blob ? result : null;
    } catch {
      return null;
    }
  },

  async set(url: string, blob: Blob): Promise<void> {
    try {
      await transaction("readwrite", (store) => store.put(blob, url));
    } catch {
      // Caching is optional; the downloaded image is still usable
    }
  },

  fetchAndCache(url: string): Promise<Blob | null> {
    const existing = pending.get(url);
    if (existing) return existing.promise;
    const task: PendingImage = {
      promise: Promise.resolve(null),
      invalidated: false,
    };
    task.promise = (async () => {
      try {
        const cached = await imageCache.get(url);
        if (cached) return cached;
        const response = await fetch(url);
        if (!response.ok) return null;
        const blob = await response.blob();
        if (!task.invalidated) await imageCache.set(url, blob);
        return blob;
      } catch {
        return null;
      } finally {
        if (pending.get(url) === task) pending.delete(url);
      }
    })();
    pending.set(url, task);
    return task.promise;
  },

  async remove(url: string): Promise<void> {
    const task = pending.get(url);
    if (task) task.invalidated = true;
    pending.delete(url);
    try {
      await transaction("readwrite", (store) => store.delete(url));
    } catch {
      // An unavailable cache must not prevent saving a profile
    }
  },

  async clear(): Promise<void> {
    pending.forEach((task) => {
      task.invalidated = true;
    });
    pending.clear();
    await transaction("readwrite", (store) => store.clear());
  },
};
