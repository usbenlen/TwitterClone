/** @format */

const DB_NAME = "tc_image_cache";
const STORE_NAME = "images";
const DB_VERSION = 1;

class ImageCache {
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async get(url: string): Promise<string | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(url);

        request.onsuccess = () => {
          const result = request.result;
          if (result instanceof Blob) {
            resolve(URL.createObjectURL(result));
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async set(url: string, blob: Blob): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.put(blob, url);
    } catch (e) {
      console.error("Failed to cache image:", e);
    }
  }

  async fetchAndCache(url: string): Promise<string | null> {
    try {
      // Don't cache data URLs or very short URLs
      if (url.startsWith("data:") || url.length < 5) return url;

      const cached = await this.get(url);
      if (cached) return cached;

      const response = await fetch(url);
      if (!response.ok) return null;

      const blob = await response.blob();
      await this.set(url, blob);
      
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Error fetching/caching image:", e);
      return url; // Return original URL if fetch fails
    }
  }

  async remove(url: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.delete(url);
    } catch (e) {
      console.error("Failed to remove image from cache:", e);
    }
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
  }
}

export const imageCache = new ImageCache();
