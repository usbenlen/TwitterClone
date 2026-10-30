// @vitest-environment happy-dom
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePostComposerMedia } from "@/hooks/composer/usePostComposerMedia";

import type { ComposerMedia } from "@/types/composer";

const mocks = vi.hoisted(() => ({
  createPreview: vi.fn(),
  prepareMedia: vi.fn(),
  upload: vi.fn(),
}));

vi.mock("@/utils/media/createPreview", () => ({
  createPreview: mocks.createPreview
}));
vi.mock("@/utils/media/prepareMedia", () => ({
  prepareMedia: mocks.prepareMedia
}));
vi.mock("@/utils/media/validateMedia", () => ({
  validateMedia: () => ({ valid: true, type: "image" })
}));
vi.mock("@/utils/composer/composerRules", () => ({
  getMediaAdditionError: () => null,
}));
vi.mock("@/hooks/composer/useMediaUpload", () => ({
  useMediaUpload: () => ({ upload: mocks.upload }),
}));

let host: HTMLDivElement;
let root: Root | null = null;
let media: ReturnType<typeof usePostComposerMedia> | null = null;

function Probe({ initialMedia }: { initialMedia?: ComposerMedia[] }) {
  const composerMedia = usePostComposerMedia(initialMedia);
  useEffect(() => {
    media = composerMedia;
  }, [composerMedia]);
  return null;
}

async function mount(initialMedia?: ComposerMedia[]) {
  await act(async () => root!.render(<Probe initialMedia={initialMedia} />));
}

const existingMedia = (
  previewUrl: string,
  id = "existing",
): ComposerMedia => ({
  id,
  attachmentId: id,
  previewUrl,
  url: previewUrl,
  type: "image",
  name: "existing.png",
  size: 1,
  status: "uploaded",
  progress: 100,
});

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  mocks.createPreview.mockReset();
  mocks.prepareMedia.mockReset();
  mocks.upload.mockReset().mockResolvedValue(undefined);
  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);
  media = null;
});

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = null;
  host.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("composer preview URL ownership", () => {
  it("does not revoke a borrowed mock attachment URL when removed or cleared", async () => {
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    await mount([
      existingMedia("blob:removed-attachment", "removed"),
      existingMedia("blob:cleared-attachment", "cleared"),
    ]);

    await act(async () => media?.removeMedia("removed"));
    expect(revoke).not.toHaveBeenCalled();

    await act(async () => media?.clearMedia());
    expect(revoke).not.toHaveBeenCalled();
  });

  it("revokes composer-owned previews after replacement and clear", async () => {
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const file = new File(["image"], "new.png", { type: "image/png" });
    mocks.createPreview.mockReturnValue({
      ...existingMedia("blob:composer-preview"),
      id: "new",
      file,
      attachmentId: undefined,
      name: file.name,
      status: "ready",
    });
    mocks.prepareMedia.mockResolvedValue({
      success: true,
      media: {
        ...existingMedia("blob:prepared-preview"),
        id: "prepared",
        file,
        attachmentId: undefined,
        name: file.name,
        status: "ready",
      },
    });
    await mount();

    await act(async () => {
      await media?.addFiles([file] as unknown as FileList);
    });
    expect(revoke.mock.calls).toEqual([["blob:composer-preview"]]);

    await act(async () => media?.clearMedia());
    expect(revoke.mock.calls).toEqual([
      ["blob:composer-preview"],
      ["blob:prepared-preview"],
    ]);
  });

  it("does not revoke borrowed attachment URLs when the editor unmounts", async () => {
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    await mount([existingMedia("blob:mock-attachment")]);

    await act(async () => root!.unmount());
    root = null;
    expect(revoke).not.toHaveBeenCalled();
  });

  it("revokes an owned preview URL when the editor unmounts", async () => {
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    const file = new File(["image"], "new.png", { type: "image/png" });
    mocks.createPreview.mockReturnValue({
      ...existingMedia("blob:composer-preview"),
      file,
      status: "ready",
    });
    mocks.prepareMedia.mockResolvedValue({
      success: true,
      media: {
        ...existingMedia("blob:prepared-preview"),
        file,
        status: "ready",
      },
    });
    await mount();
    await act(async () => {
      await media?.addFiles([file] as unknown as FileList);
    });

    await act(async () => root!.unmount());
    root = null;
    expect(revoke.mock.calls).toEqual([
      ["blob:composer-preview"],
      ["blob:prepared-preview"],
    ]);
  });
});
