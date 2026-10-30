// @vitest-environment happy-dom
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import GifPicker from "@/components/composer/gifs/GifPicker";
import { SEARCH_DEBOUNCE_MS } from "@/constants/interaction";
import { useComposerGif } from "@/hooks/composer/useComposerGif";
import type { Gif } from "@/types/gif";

const mocks = vi.hoisted(() => ({
  api: { available: true, search: vi.fn() },
  select: vi.fn(),
}));
vi.mock("@/api/gifApi", () => ({ gifApi: mocks.api }));

const gif: Gif = {
  id: "gif", title: "Animation",
  previewUrl: "https://example.com/preview.gif",
  originalUrl: "https://example.com/original.gif",
  width: 320, height: 240,
};

let host: HTMLDivElement;
let root: Root;
let state: ReturnType<typeof useComposerGif>;

function Probe() {
  const gif = useComposerGif();
  useEffect(() => { state = gif; });
  return (
    <>
      <button onClick={gif.toggle}>GIF</button>
      {gif.isOpen && (
        <GifPicker
          available={gif.available}
          query={gif.query}
          gifs={gif.gifs}
          loading={gif.loading}
          error={gif.error}
          onQueryChange={gif.setQuery}
          onSelect={mocks.select}
        />
      )}
    </>
  );
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.api.available = true;
  mocks.api.search.mockReset().mockResolvedValue([]);
  mocks.select.mockReset();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<Probe />));
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("composer GIF panel", () => {
  it("shows the picker with a disabled search and unavailable message in mock mode", async () => {
    mocks.api.available = false;
    await act(async () => host.querySelector("button")!.click());
    expect(host.querySelector('[role="status"]')?.textContent).toBe(
      "GIF недоступні в mock режимі.",
    );
    const input = host.querySelector("input")!;
    expect(input.placeholder).toBe("Пошук GIF...");
    expect(input.disabled).toBe(true);
    act(() => input.focus());
    expect(document.activeElement).not.toBe(input);
    expect(host.textContent).not.toContain("Завантаження...");
    expect(host.textContent).not.toContain("GIF не знайдено.");
    expect(host.querySelector("img")).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(mocks.api.search).not.toHaveBeenCalled();
    act(() => state.close());
    expect(host.querySelector('[role="status"]')).toBeNull();
    await act(async () => state.open());
    expect(mocks.api.search).not.toHaveBeenCalled();
    expect(host.querySelector("input")?.disabled).toBe(true);
  });

  it("loads real results and lets the user select a GIF", async () => {
    mocks.api.search.mockResolvedValueOnce([gif]);
    await act(async () => state.open());
    expect(host.querySelector("input")?.disabled).toBe(false);
    const image = host.querySelector("img")!;
    expect(image.alt).toBe(gif.title);
    act(() => image.closest("button")!.click());
    expect(mocks.select).toHaveBeenCalledExactlyOnceWith(gif);
  });

  it("shows an empty result separately from a loading failure", async () => {
    await act(async () => state.open());
    expect(host.textContent).toContain("GIF не знайдено.");
    act(() => state.close());
    mocks.api.search.mockRejectedValueOnce(new Error("Некоректна відповідь сервісу GIF."));
    await act(async () => state.open());
    expect(host.textContent).toContain("Не вдалося завантажити GIF.");
    expect(host.textContent).not.toContain("GIF не знайдено.");
    expect(host.querySelector("img")).toBeNull();
    expect(state.loading).toBe(false);
  });

  it("aborts outdated requests and ignores their later results after search or close", async () => {
    vi.useFakeTimers();
    let finishOld!: (items: Gif[]) => void;
    mocks.api.search.mockReturnValueOnce(new Promise<Gif[]>((resolve) => {
      finishOld = resolve;
    }));
    await act(async () => state.open());
    const firstSignal = mocks.api.search.mock.calls[0][1] as AbortSignal;
    act(() => state.setQuery("cats"));
    expect(firstSignal.aborted).toBe(true);
    const latest = { ...gif, id: "latest", title: "Cats" };
    mocks.api.search.mockResolvedValueOnce([latest]);
    await act(async () => vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS));
    expect(state.gifs).toEqual([latest]);
    await act(async () => finishOld([gif]));
    expect(state.gifs).toEqual([latest]);

    let finishClosed!: (items: Gif[]) => void;
    mocks.api.search.mockReturnValueOnce(new Promise<Gif[]>((resolve) => {
      finishClosed = resolve;
    }));
    act(() => state.setQuery("dogs"));
    await act(async () => vi.advanceTimersByTimeAsync(SEARCH_DEBOUNCE_MS));
    const lastSignal = mocks.api.search.mock.calls.at(-1)![1] as AbortSignal;
    act(() => state.close());
    expect(lastSignal.aborted).toBe(true);
    await act(async () => finishClosed([gif]));
    expect(state.gifs).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
});
