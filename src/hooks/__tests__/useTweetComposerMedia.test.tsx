// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTweetComposerMedia } from "@/hooks/composer/media/useTweetComposerMedia";

const mocks = vi.hoisted(() => ({ compress: vi.fn(), upload: vi.fn() }));
vi.mock("@/utils/media/compressImage", () => ({
  compressImage: mocks.compress,
}));
vi.mock("@/api", () => ({ mediaApi: { upload: mocks.upload } }));

let root: Root;
let host: HTMLDivElement;
function mount() {
  let result!: ReturnType<typeof useTweetComposerMedia>;
  function Probe() {
    result = useTweetComposerMedia();
    return null;
  }
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<Probe />));
  return () => result;
}
function files(...types: string[]): FileList {
  return types.map(
    (type, index) =>
      new File(["media"], `${index}.${type.split("/")[1]}`, { type }),
  ) as unknown as FileList;
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(URL, "createObjectURL").mockImplementation(
    () => `blob:${crypto.randomUUID()}`,
  );
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  mocks.compress.mockReset().mockImplementation(async (file: File) => file);
  mocks.upload
    .mockReset()
    .mockImplementation(async () => ({ id: crypto.randomUUID() }));
});
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("media reservations and preparation", () => {
  it("reserves four slots before awaiting compression across repeated calls", async () => {
    const pending = deferred<File>();
    mocks.compress.mockImplementation(() => pending.promise);
    const read = mount();
    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      first = read().addFiles(files("image/png", "image/png", "image/png"));
      second = read().addFiles(files("image/png", "image/png"));
    });
    expect(read().media).toHaveLength(4);
    expect(read().media.every((item) => item.status === "compressing")).toBe(
      true,
    );
    expect(read().errors[0].message).toContain("4");
    await act(async () => {
      pending.resolve(
        new File(["compressed"], "image.png", { type: "image/png" }),
      );
      await Promise.all([first, second]);
    });
    expect(read().media).toHaveLength(4);
    expect(read().media.every((item) => item.status === "uploaded")).toBe(true);
    expect(mocks.upload).toHaveBeenCalledTimes(4);
  });
  it("does not resurrect cleared or removed media after preparation", async () => {
    const pending = deferred<File>();
    mocks.compress.mockImplementation(() => pending.promise);
    const read = mount();
    let adding!: Promise<void>;
    act(() => {
      adding = read().addFiles(files("image/png", "image/png"));
    });
    act(() => {
      read().removeMedia(read().media[0].id);
      read().clearMedia();
    });
    await act(async () => {
      pending.resolve(new File(["image"], "image.png", { type: "image/png" }));
      await adding;
    });
    expect(read().media).toEqual([]);
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(4);
  });
  it("keeps animated local GIFs intact and rejects other files in the same batch", async () => {
    const read = mount();
    const selection = files("image/gif", "image/png", "video/mp4", "image/gif");
    await act(async () => {
      await read().addFiles(selection);
    });
    expect(read().media).toHaveLength(1);
    expect(read().media[0].type).toBe("gif");
    expect(mocks.compress).not.toHaveBeenCalled();
    expect(mocks.upload.mock.calls[0][0]).toBe(selection[0]);
    expect(read().errors).toHaveLength(3);
    act(() => read().removeMedia(read().media[0].id));
    await act(async () => {
      await read().addFiles(files("video/mp4", "image/png"));
    });
    expect(read().media.map((item) => item.type)).toEqual(["video", "image"]);
  });
  it("reserves a GIF before download and prevents repeated GIF selection", async () => {
    const response = deferred<Response>();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => response.promise),
    );
    const read = mount();
    const gif = {
      id: "gif",
      title: "Animation",
      originalUrl: "https://example.com/animation.gif",
      previewUrl: "https://example.com/preview.gif",
      width: 100,
      height: 100,
    };
    let adding!: Promise<void>;
    act(() => {
      adding = read().addGif(gif);
    });
    await act(async () => {
      await read().addGif(gif);
      await read().addFiles(files("video/mp4"));
    });
    expect(read().media).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(1);
    act(() => read().clearMedia());
    await act(async () => {
      response.resolve(new Response(new Blob(["gif"], { type: "image/gif" })));
      await adding;
    });
    expect(read().media).toEqual([]);
    expect(mocks.upload).not.toHaveBeenCalled();
  });
  it("ignores upload completion and failures for removed items", async () => {
    const pending = deferred<{ id: string }>();
    mocks.upload.mockImplementation(() => pending.promise);
    const read = mount();
    let adding!: Promise<void>;
    await act(async () => {
      adding = read().addFiles(files("video/mp4"));
      await Promise.resolve();
    });
    expect(read().media[0].status).toBe("uploading");
    act(() => read().clearMedia());
    await act(async () => {
      pending.reject(new Error("offline"));
      await adding;
    });
    expect(read().media).toEqual([]);
    expect(read().errors).toEqual([]);
  });
  it("marks preparation failures and permits recovery by removing the item", async () => {
    mocks.compress.mockRejectedValue(new Error("compression failed"));
    const read = mount();
    await act(async () => {
      await read().addFiles(files("image/png"));
    });
    expect(read().media[0].status).toBe("error");
    expect(read().errors[0].message).toContain("compression failed");
    act(() => read().removeMedia(read().media[0].id));
    await act(async () => {
      await read().addFiles(files("video/mp4"));
    });
    expect(read().media[0].status).toBe("uploaded");
  });
});
