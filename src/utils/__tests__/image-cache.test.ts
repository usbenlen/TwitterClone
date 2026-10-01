import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ items: new Map<string, Blob>(), fail: false }));
vi.mock("@/utils/indexedDb", () => ({
  createIndexedDbStore:
    () => async (_mode: string, operation: (store: object) => unknown) => {
      if (db.fail) throw new Error("storage unavailable");
      return operation({
        get: (key: string) => db.items.get(key),
        put: (blob: Blob, key: string) => db.items.set(key, blob),
        delete: (key: string) => db.items.delete(key),
        clear: () => db.items.clear(),
      });
    },
}));
beforeEach(() => {
  vi.resetModules();
  db.items.clear();
  db.fail = false;
});
afterEach(() => vi.unstubAllGlobals());

describe("image cache", () => {
  it("returns cached blobs without allocating object URLs or fetching", async () => {
    const blob = new Blob(["cached"]);
    db.items.set("/avatar.png", blob);
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const { imageCache } = await import("@/utils/image-cache");
    expect(await imageCache.fetchAndCache("/avatar.png")).toBe(blob);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("shares a download between concurrent consumers", async () => {
    const blob = new Blob(["download"]);
    const fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, blob: async () => blob });
    vi.stubGlobal("fetch", fetch);
    const { imageCache } = await import("@/utils/image-cache");
    const first = imageCache.fetchAndCache("/avatar.png");
    const second = imageCache.fetchAndCache("/avatar.png");
    expect(first).toBe(second);
    expect(await first).toBe(blob);
    expect(fetch).toHaveBeenCalledOnce();
    expect(db.items.get("/avatar.png")).toBe(blob);
  });
  it("can still download when storage is unavailable", async () => {
    db.fail = true;
    const blob = new Blob(["download"]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, blob: async () => blob }),
    );
    const { imageCache } = await import("@/utils/image-cache");
    expect(await imageCache.fetchAndCache("/avatar.png")).toBe(blob);
  });
  it("returns null on network failure so callers can use the original URL", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { imageCache } = await import("@/utils/image-cache");
    expect(await imageCache.fetchAndCache("/avatar.png")).toBeNull();
  });
  it("invalidates an entry even when its download was still in progress", async () => {
    let finish!: (response: object) => void;
    const fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetch);
    const { imageCache } = await import("@/utils/image-cache");
    const download = imageCache.fetchAndCache("/avatar.png");
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const removal = imageCache.remove("/avatar.png");
    await removal;
    finish({ ok: true, blob: async () => new Blob(["old avatar"]) });
    await Promise.all([download, removal]);
    expect(db.items.has("/avatar.png")).toBe(false);
  });
});
