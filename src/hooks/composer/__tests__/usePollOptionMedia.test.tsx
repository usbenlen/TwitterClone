// @vitest-environment happy-dom
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useComposerPoll } from "@/hooks/composer/useComposerPoll";

import { createAppStore } from "@/store/store";
import { sessionChanged } from "@/store/session";

import type { ComposerPoll } from "@/types/pollDraft";
import type { MediaAttachment } from "@/types/media";

const mocks = vi.hoisted(() => ({ upload: vi.fn(), compress: vi.fn() }));
vi.mock("@/api/mediaApi", () => ({ mediaApi: { upload: mocks.upload } }));
vi.mock("@/utils/media/compressImage", () => ({
  compressImage: mocks.compress,
}));
vi.mock("@/constants/app", async (original) => ({
  ...(await original<object>()),
  ENABLE_IMAGE_UPLOAD: true,
}));

const photo = (name = "photo.png") =>
  new File(["image"], name, { type: "image/png" });
const attachment: MediaAttachment = {
  id: "uploaded",
  type: "image",
  url: "https://example.com/photo.png",
};
const initial: ComposerPoll = {
  duration: 60,
  options: [
    { id: "a", text: "Так" },
    { id: "b", text: "Ні" },
    { id: "c", text: "Можливо" },
  ],
};
let root: Root;
let host: HTMLDivElement;
let editor: ReturnType<typeof useComposerPoll>;
let store: ReturnType<typeof createAppStore>;

function Probe({ poll = initial }: { poll?: ComposerPoll }) {
  const value = useComposerPoll(poll);
  useEffect(() => {
    editor = value;
  });
  return null;
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(URL, "createObjectURL").mockImplementation(
    () => `blob:${crypto.randomUUID()}`,
  );
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  mocks.compress.mockReset().mockImplementation(async (file: File) => file);
  mocks.upload.mockReset().mockResolvedValue(attachment);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  store = createAppStore();
  act(() =>
    root.render(
      <Provider store={store}>
        <Probe />
      </Provider>,
    ),
  );
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  store.dispatch(sessionChanged());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("poll option media", () => {
  it("uploads one image per option, exposes progress and revokes owned previews", async () => {
    mocks.upload.mockImplementation(
      async (
        _file: File,
        options: { onProgress: (progress: number) => void },
      ) => {
        options.onProgress(50);
        expect(editor.getPoll().options[0].image).toMatchObject({
          status: "uploading",
          progress: 50,
        });
        return attachment;
      },
    );
    await act(async () => editor.images.select("a", photo()));
    expect(editor.poll.options[0].image).toMatchObject({
      status: "uploaded",
      attachmentId: "uploaded",
      progress: 100,
    });
    const preview = editor.poll.options[0].image!.previewUrl;
    act(() => editor.images.remove("a"));
    expect(editor.poll.options[0].image).toBeUndefined();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(preview);
  });

  it("rejects GIF/video and permits retrying an unsuccessful upload", async () => {
    await act(async () =>
      editor.images.select(
        "a",
        new File(["gif"], "x.gif", { type: "image/gif" }),
      ),
    );
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(editor.images.errors.a).toContain("JPEG");
    mocks.upload.mockRejectedValueOnce(new Error("Помилка мережі"));
    await act(async () => editor.images.select("a", photo()));
    expect(editor.poll.options[0].image?.status).toBe("error");
    expect(editor.images.errors.a).toContain("Помилка мережі");
    await act(async () => editor.images.retry("a"));
    expect(editor.poll.options[0].image?.status).toBe("uploaded");
    expect(editor.images.errors.a).toBeUndefined();
  });

  it("ignores a replaced upload even if it completes last", async () => {
    let resolve!: (value: MediaAttachment) => void;
    mocks.upload.mockImplementationOnce(
      () =>
        new Promise<MediaAttachment>((yes) => {
          resolve = yes;
        }),
    );
    let pending!: Promise<void>;
    await act(async () => {
      pending = editor.images.select("a", photo("first.png"));
    });
    await act(async () => editor.images.select("a", photo("second.png")));
    await act(async () => {
      resolve({ ...attachment, id: "stale" });
      await pending;
    });
    expect(editor.poll.options[0].image).toMatchObject({
      name: "second.png",
      attachmentId: "uploaded",
    });
  });

  it.each(["remove-option", "reset", "session"])(
    "ignores upload completion after %s",
    async (action) => {
      let resolve!: (value: MediaAttachment) => void;
      mocks.upload.mockImplementationOnce(
        () =>
          new Promise<MediaAttachment>((yes) => {
            resolve = yes;
          }),
      );
      let pending!: Promise<void>;
      await act(async () => {
        pending = editor.images.select("a", photo());
      });
      act(() => {
        if (action === "remove-option") editor.removeOption("a");
        else if (action === "reset") editor.reset();
        else store.dispatch(sessionChanged());
      });
      await act(async () => {
        resolve(attachment);
        await pending;
      });
      expect(
        editor.getPoll().options.find((option) => option.id === "a")?.image
          ?.attachmentId,
      ).toBeUndefined();
    },
  );

  it("releases a preview prepared after its option was removed", async () => {
    let resolve!: (value: File) => void;
    mocks.compress.mockImplementationOnce(
      () =>
        new Promise<File>((yes) => {
          resolve = yes;
        }),
    );
    let pending!: Promise<void>;
    await act(async () => {
      pending = editor.images.select("a", photo());
    });
    act(() => editor.removeOption("a"));
    await act(async () => {
      resolve(photo());
      await pending;
    });
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it("does not revoke borrowed mock media when an existing poll is cleared", () => {
    const poll = {
      ...initial,
      options: [
        {
          ...initial.options[0],
          image: {
            id: "borrowed",
            attachmentId: "borrowed",
            type: "image" as const,
            status: "uploaded" as const,
            previewUrl: "blob:mock-owned",
            name: "photo.png",
            size: 5,
            progress: 100,
          },
        },
        ...initial.options.slice(1),
      ],
    };
    act(() =>
      root.render(
        <Provider store={store}>
          <Probe key="existing" poll={poll} />
        </Provider>,
      ),
    );
    act(() => editor.reset());
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });
});
