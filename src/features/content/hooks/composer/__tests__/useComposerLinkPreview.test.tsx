// @vitest-environment happy-dom
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { linkPreviewApi } from "@/features/content/api";
import { useComposerLinkPreview } from "@/features/content/hooks/composer/useComposerLinkPreview";
import type { LinkPreview } from "@/features/content/types";

vi.mock("@/shared/config/featureFlags", () => ({ ENABLE_LINK_PREVIEWS: true }));
vi.mock("@/features/content/constants/composer", () => ({ LINK_PREVIEW_DEBOUNCE_MS: 300 }));
vi.mock("@/features/content/api", () => ({ linkPreviewApi: { resolve: vi.fn() } }));

const resolve = vi.mocked(linkPreviewApi.resolve);
const preview: LinkPreview = {
  id: "preview",
  url: "https://react.dev/",
  domain: "react.dev",
  title: "React",
  imageUrl: null,
};

let root: Root;
let current: ReturnType<typeof useComposerLinkPreview>;

function Probe({ content, initial }: { content: string; initial?: LinkPreview }) {
  const result = useComposerLinkPreview(content, initial);
  useEffect(() => {
    current = result;
  }, [result]);
  return null;
}

async function render(content: string, initial?: LinkPreview) {
  await act(async () => root.render(<Probe content={content} initial={initial} />));
}

async function advance(ms: number) {
  await act(async () => vi.advanceTimersByTimeAsync(ms));
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  resolve.mockReset();
  root = createRoot(document.createElement("div"));
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("debounces typing and keeps the result when the server returns a canonical URL", async () => {
  resolve.mockResolvedValue(preview);
  for (const url of ["https://react.d", "https://react.de", "https://react.dev"]) {
    await render(url);
    await advance(100);
    expect(current.preview).toBeNull();
    expect(resolve).not.toHaveBeenCalled();
  }

  await advance(200);
  expect(resolve).toHaveBeenCalledWith("https://react.dev", expect.any(AbortSignal));
  expect(current.preview).toEqual(preview);

  await render("Документація https://react.dev");
  await advance(1500);
  expect(resolve).toHaveBeenCalledTimes(1);
  expect(current.preview).toEqual(preview);
});

it("ignores an older response even when the adapter completes after cancellation", async () => {
  let complete!: (value: LinkPreview) => void;
  resolve.mockImplementationOnce(() => new Promise((resolve) => { complete = resolve; }));
  const updated = { ...preview, url: "https://react.dev/learn", title: "Learn React" };
  resolve.mockResolvedValueOnce(updated);

  await render("https://react.dev");
  await advance(300);
  const signal = resolve.mock.calls[0][1];
  await render(updated.url);
  expect(signal?.aborted).toBe(true);
  await advance(300);
  await act(async () => complete(preview));
  expect(current.preview).toEqual(updated);
});

it("preserves an existing preview and respects dismissal until the URL is removed", async () => {
  resolve.mockResolvedValue(preview);
  await render("https://react.dev", preview);
  await advance(300);
  expect(current.preview).toEqual(preview);
  expect(resolve).not.toHaveBeenCalled();

  await act(async () => current.remove());
  await render("Документація https://react.dev");
  await advance(300);
  expect(current.preview).toBeNull();
  expect(resolve).not.toHaveBeenCalled();

  await render("");
  await render("https://react.dev");
  await advance(300);
  expect(current.preview).toEqual(preview);
  expect(resolve).toHaveBeenCalledTimes(1);
});
