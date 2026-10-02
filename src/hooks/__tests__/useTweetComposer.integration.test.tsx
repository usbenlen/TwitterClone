// @vitest-environment happy-dom
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTweetComposer } from "@/hooks/composer/useTweetComposer";
import PollComposer from "@/components/composer/poll/PollComposer";
import ComposerToolbar from "@/components/composer/ComposerToolbar";
import type { ComposerMedia, Location } from "@/types";

const mocks = vi.hoisted(() => ({
  submit: vi.fn(),
  schedule: vi.fn(),
  upload: vi.fn(),
}));
vi.mock("@/api", () => ({ mediaApi: { upload: mocks.upload } }));
vi.mock("@/api/gif.api", () => ({ gifApi: { search: async () => [] } }));
vi.mock("@/api/location.api", () => ({
  locationApi: { search: async () => [] },
}));
vi.mock("@/hooks/useScheduledPosts", () => ({
  useScheduledPosts: () => ({ create: mocks.schedule }),
}));
vi.mock("@/hooks/composer/linkPreview/useComposerLinkPreview", () => ({
  useComposerLinkPreview: () => ({
    preview: null,
    loading: false,
    clear: vi.fn(),
    remove: vi.fn(),
  }),
}));
vi.mock("@/hooks/composer/useComposerSubmit", () => ({
  useComposerSubmit: () => {
    const [isPosting, setPosting] = useState(false);
    return {
      isPosting,
      submit: async (values: unknown) => {
        setPosting(true);
        try {
          return await mocks.submit(values);
        } finally {
          setPosting(false);
        }
      },
    };
  },
}));

let root: Root;
let host: HTMLDivElement;
function mount(options: Parameters<typeof useTweetComposer>[0] = {}) {
  let result!: ReturnType<typeof useTweetComposer>;
  function Probe() {
    result = useTweetComposer(options);
    return (
      <>
        <ComposerToolbar
          onAction={result.handleAction}
          disabledActions={result.disabledActions}
        />
        {result.pollEditor.visible && <PollComposer {...result.pollEditor} />}
      </>
    );
  }
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<Probe />));
  return () => result;
}
const location: Location = {
  id: "kyiv",
  name: "Київ",
  country: "Україна",
  latitude: 50.45,
  longitude: 30.52,
};
const uploaded: ComposerMedia = {
  id: "image",
  attachmentId: "image",
  type: "image",
  status: "uploaded",
  previewUrl: "https://example.com/image.png",
  name: "image",
  size: 1,
  progress: 100,
};
const selection = () =>
  [
    new File(["video"], "video.mp4", { type: "video/mp4" }),
  ] as unknown as FileList;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(URL, "createObjectURL").mockImplementation(
    () => `blob:${crypto.randomUUID()}`,
  );
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  mocks.submit.mockReset().mockResolvedValue(true);
  mocks.schedule.mockReset().mockResolvedValue({ id: "scheduled" });
  mocks.upload.mockReset().mockResolvedValue({ id: "video" });
});
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("composer interactions", () => {
  it("blocks files immediately after poll activation, including before a render", async () => {
    const read = mount({ initialContent: "Question", allowScheduling: true });
    act(() => {
      read().handleAction("poll");
      read().onFilesSelected(selection());
    });
    expect(read().media).toEqual([]);
    expect(read().pollEditor.visible).toBe(true);
    expect(read().canSubmit).toBe(false);
    expect(read().disabledActions).toEqual(
      expect.arrayContaining(["image", "video", "gif", "poll", "schedule"]),
    );
    expect(
      host.querySelector<HTMLButtonElement>('button[aria-label="Додати відео"]')
        ?.disabled,
    ).toBe(true);
    expect(mocks.upload).not.toHaveBeenCalled();
    act(() => read().pollEditor.onRemove());
    await act(async () => {
      read().onFilesSelected(selection());
      await Promise.resolve();
    });
    expect(read().media).toHaveLength(1);
    act(() => read().handleAction("poll"));
    expect(read().pollEditor.visible).toBe(false);
  });
  it("guards poll activation while media is reserved and restores it after removal", async () => {
    const read = mount();
    await act(async () => {
      read().onFilesSelected(selection());
      read().handleAction("poll");
      await Promise.resolve();
    });
    expect(read().pollEditor.visible).toBe(false);
    act(() => {
      read().removeMedia(read().media[0].id);
      read().handleAction("poll");
    });
    expect(read().pollEditor.visible).toBe(true);
    expect(document.activeElement).toBe(
      read().pollEditor.firstOptionRef.current,
    );
  });
  it("permits one location with a poll, then re-enables location after removal", () => {
    const read = mount();
    act(() => {
      read().handleAction("poll");
      read().popovers.location.onSelect(location);
      read().popovers.location.onSelect({ ...location, id: "other" });
    });
    expect(read().locationPreview.location?.id).toBe("kyiv");
    expect(read().disabledActions).toContain("location");
    expect(read().pollEditor.visible).toBe(true);
    act(() => read().locationPreview.onRemove());
    expect(read().disabledActions).not.toContain("location");
  });
  it("limits Unicode poll options and exposes duration controls with boundary errors", () => {
    const read = mount();
    act(() => read().handleAction("poll"));
    const ids = read().pollEditor.poll.options.map((option) => option.id);
    act(() => {
      read().pollEditor.onOptionChange(ids[0], "😀".repeat(26));
      read().pollEditor.onOptionChange(ids[1], "Ні");
      read().pollEditor.onDurationChange(5);
    });
    expect(Array.from(read().pollEditor.poll.options[0].text)).toHaveLength(25);
    expect(read().canSubmit).toBe(true);
    expect(host.textContent).toContain("25/25");
    expect(host.querySelectorAll("select")).toHaveLength(3);
    act(() => read().pollEditor.onDurationChange(4));
    expect(read().canSubmit).toBe(false);
    expect(host.textContent).toContain("від 5 хвилин до 7 днів");
    const days = host.querySelector<HTMLSelectElement>('select[id$="-days"]')!;
    act(() => {
      days.value = "7";
      days.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(read().pollEditor.poll.duration).toBe(10080);
    expect(read().canSubmit).toBe(true);
    expect(
      host.querySelector<HTMLSelectElement>('select[id$="-hours"]')!.disabled,
    ).toBe(true);
    expect(
      host.querySelector<HTMLSelectElement>('select[id$="-minutes"]')!.disabled,
    ).toBe(true);
    act(() => {
      read().pollEditor.onAddOption();
      read().pollEditor.onAddOption();
      read().pollEditor.onAddOption();
    });
    expect(read().pollEditor.poll.options).toHaveLength(4);
  });
  it("validates Unicode body length and invalid initial attachment combinations", () => {
    const read = mount({ initialContent: "😀".repeat(280) });
    expect(read().remaining).toBe(0);
    expect(read().canSubmit).toBe(true);
    act(() => read().setContent("😀".repeat(281)));
    expect(read().remaining).toBe(-1);
    expect(read().canSubmit).toBe(false);
  });
  it("blocks an initial media/poll conflict instead of silently fixing it", async () => {
    const read = mount({
      initialMedia: [uploaded],
      initialPoll: {
        duration: 5,
        options: [
          { id: "1", text: "Так" },
          { id: "2", text: "Ні" },
        ],
      },
    });
    expect(read().canSubmit).toBe(false);
    await act(async () => {
      await read().submit();
    });
    expect(mocks.submit).not.toHaveBeenCalled();
    act(() => read().pollEditor.onRemove());
    expect(read().canSubmit).toBe(true);
  });
  it("schedules mixed media and preserves the draft on a false result", async () => {
    const read = mount({
      initialContent: "Later",
      initialMedia: [
        uploaded,
        { ...uploaded, id: "video", attachmentId: "video", type: "video" },
      ],
      allowScheduling: true,
    });
    expect(read().disabledActions).not.toContain("schedule");
    act(() => read().scheduling.apply("2099-01-01T00:00:00Z"));
    expect(read().disabledActions).toEqual(
      expect.arrayContaining(["poll", "location"]),
    );
    mocks.schedule.mockResolvedValue(false);
    await act(async () => {
      expect(await read().submit()).toBe(false);
    });
    expect(read().content).toBe("Later");
    expect(read().media).toHaveLength(2);
    expect(read().scheduling.scheduledAt).not.toBeNull();
    mocks.schedule.mockResolvedValue({ id: "scheduled" });
    await act(async () => {
      await read().submit();
    });
    expect(read().content).toBe("");
    expect(read().media).toEqual([]);
    expect(read().scheduling.scheduledAt).toBeNull();
  });
  it("keeps scheduled state after a network error", async () => {
    const read = mount({ initialContent: "Later", allowScheduling: true });
    act(() => read().scheduling.apply("2099-01-01T00:00:00Z"));
    mocks.schedule.mockRejectedValue(new Error("offline"));
    await act(async () => {
      await expect(read().submit()).rejects.toThrow("offline");
    });
    expect(read().content).toBe("Later");
    expect(read().scheduling.scheduledAt).toBe("2099-01-01T00:00:00Z");
    expect(read().canSubmit).toBe(true);
  });
  it("treats repeated popup-open notifications as idempotent", async () => {
    const read = mount();
    await act(async () => {
      read().popovers.gif.onOpenChange(true);
    });
    expect(read().popovers.gif.open).toBe(true);
    await act(async () => {
      read().popovers.gif.onOpenChange(true);
    });
    expect(read().popovers.gif.open).toBe(true);
    act(() => read().handleAction("poll"));
    await act(async () => {
      read().popovers.gif.onOpenChange(true);
    });
    expect(read().popovers.gif.open).toBe(false);
  });
  it("blocks duplicate submission and attachment edits while posting and retains the draft on failure", async () => {
    let resolve!: (value: boolean) => void;
    mocks.submit.mockImplementation(
      () =>
        new Promise<boolean>((res) => {
          resolve = res;
        }),
    );
    const read = mount({
      initialContent: "Hello",
      initialMedia: [uploaded],
      initialLocation: location,
    });
    let posting!: Promise<unknown>;
    act(() => {
      posting = read().submit();
      read().onFilesSelected(selection());
      read().removeMedia("image");
      read().setContent("Changed");
      read().locationPreview.onRemove();
      void read().submit();
    });
    expect(read().disabledActions).toHaveLength(7);
    expect(read().content).toBe("Hello");
    expect(read().media).toHaveLength(1);
    expect(read().locationPreview.visible).toBe(true);
    expect(mocks.submit).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolve(false);
      await posting;
    });
    expect(read().content).toBe("Hello");
    expect(read().media).toHaveLength(1);
    expect(read().canSubmit).toBe(true);
  });
  it("submits current attachments when removal and submission share a render", async () => {
    const read = mount({ initialContent: "Hello", initialMedia: [uploaded] });
    await act(async () => {
      read().removeMedia("image");
      await read().submit();
    });
    expect(mocks.submit.mock.calls[0][0].media).toEqual([]);
  });
});
