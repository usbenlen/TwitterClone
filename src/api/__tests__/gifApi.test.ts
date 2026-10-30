import { afterEach, describe, expect, it, vi } from "vitest";

import { ENDPOINTS } from "@/api/apiEndpoints";
import type { Gif } from "@/types/gif";

const mocks = vi.hoisted(() => ({ get: vi.fn(), mock: false }));
vi.mock("@/api/httpClient", () => ({ apiClient: { get: mocks.get } }));
vi.mock("@/config/mockConfig", () => ({
  get MOCK_ENABLED() { return mocks.mock; },
}));

const gif: Gif = {
  id: "gif-1",
  title: "Animation",
  originalUrl: "https://example.com/original.gif",
  previewUrl: "https://example.com/preview.gif",
  width: 320,
  height: 240,
};

async function loadApi(mock = false) {
  vi.resetModules();
  mocks.mock = mock;
  return (await import("@/api/gifApi")).gifApi;
}

afterEach(() => vi.resetAllMocks());

describe("GIF adapters", () => {
  it("makes no HTTP requests in mock mode", async () => {
    const api = await loadApi(true);
    expect(api.available).toBe(false);
    expect(await api.search("cats", new AbortController().signal)).toEqual([]);
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it.each([undefined, "  ", " cats & dogs "])(
    "keeps the real search contract for query %s",
    async (query) => {
      const api = await loadApi();
      const signal = new AbortController().signal;
      mocks.get.mockResolvedValueOnce([gif]);
      expect(api.available).toBe(true);
      expect(await api.search(query, signal)).toEqual([gif]);
      expect(mocks.get).toHaveBeenCalledExactlyOnceWith(
        query?.trim()
          ? `${ENDPOINTS.search.gifs}?q=cats%20%26%20dogs`
          : ENDPOINTS.search.gifs,
        { signal },
      );
    },
  );

  it("accepts an empty result", async () => {
    const api = await loadApi();
    mocks.get.mockResolvedValueOnce([]);
    expect(await api.search()).toEqual([]);
  });

  it.each([
    "<!doctype html><html>SPA fallback</html>",
    { items: [gif] },
    null,
    [null],
    [{ ...gif, previewUrl: undefined }],
    [{ ...gif, width: "320" }],
    [{ ...gif, height: Infinity }],
  ])("rejects malformed payloads: %j", async (payload) => {
    const api = await loadApi();
    mocks.get.mockResolvedValueOnce(payload);
    await expect(api.search()).rejects.toThrow("Некоректна відповідь сервісу GIF");
  });

  it("preserves request failures and cancellation", async () => {
    const api = await loadApi();
    const offline = new Error("offline");
    mocks.get.mockRejectedValueOnce(offline);
    await expect(api.search()).rejects.toBe(offline);
    const aborted = new DOMException("Aborted", "AbortError");
    mocks.get.mockRejectedValueOnce(aborted);
    await expect(api.search()).rejects.toBe(aborted);
  });
});
