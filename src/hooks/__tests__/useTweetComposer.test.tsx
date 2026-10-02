import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTweetComposer } from "@/hooks/composer/useTweetComposer";
import type { ComposerPoll } from "@/types";

const mocks = vi.hoisted(() => ({
  active: false,
  valid: false,
  poll: {
    duration: 1440,
    options: [
      { id: "1", text: "Yes" },
      { id: "2", text: "No" },
    ],
  } as ComposerPoll,
  submit: vi.fn(),
  reset: vi.fn(),
  closeAllPopups: vi.fn(),
}));
vi.mock("@/hooks/composer", () => ({
  useComposerEditor: () => ({ editorRef: { current: null } }),
  useTweetComposerMedia: () => ({
    media: [],
    getMedia: () => [],
    errors: [],
    clearMedia: vi.fn(),
    clearErrors: vi.fn(),
  }),
  useComposerLinkPreview: () => ({ preview: null, clear: vi.fn() }),
  useComposerSubmit: () => ({ submit: mocks.submit, isPosting: false }),
  useComposerActions: () => ({
    buttonRefs: {},
    closeAllPopups: mocks.closeAllPopups,
    emoji: {},
    gif: {},
    location: {},
    schedule: {},
    poll: {
      isActive: mocks.active,
      getIsActive: () => mocks.active,
      isValid: mocks.valid,
      poll: mocks.poll,
      firstOptionRef: { current: null },
      reset: mocks.reset,
    },
  }),
}));
vi.mock("@/hooks/composer/useComposerScheduling", () => ({
  useComposerScheduling: () => ({
    scheduledAt: null,
    isScheduling: false,
    scheduling: {},
  }),
}));

function renderComposer(options: Parameters<typeof useTweetComposer>[0] = {}) {
  let result!: ReturnType<typeof useTweetComposer>;
  function Probe() {
    result = useTweetComposer(options);
    return null;
  }
  renderToString(<Probe />);
  return result;
}

beforeEach(() => {
  mocks.active = false;
  mocks.valid = false;
  mocks.submit.mockReset().mockResolvedValue(true);
  mocks.reset.mockClear();
  mocks.closeAllPopups.mockClear();
});

describe("inline poll lifecycle", () => {
  it("shows an added empty poll, tracks the draft and blocks posting and scheduling", async () => {
    mocks.active = true;
    const composer = renderComposer({
      initialContent: "Question",
      allowScheduling: true,
    });
    expect(composer.pollEditor.visible).toBe(true);
    expect(composer.hasChanges).toBe(true);
    expect(composer.canSubmit).toBe(false);
    expect(composer.disabledActions).toContain("schedule");
    await composer.submit();
    expect(mocks.submit).not.toHaveBeenCalled();
  });

  it("blocks an invalid poll even when empty submission is allowed", () => {
    mocks.active = true;
    expect(renderComposer({ allowEmptySubmit: true }).canSubmit).toBe(false);
  });

  it("allows a valid poll without body text", () => {
    mocks.active = true;
    mocks.valid = true;
    expect(renderComposer().canSubmit).toBe(true);
  });

  it("clears the poll after successful submission", async () => {
    mocks.active = true;
    mocks.valid = true;
    await renderComposer().submit();
    expect(mocks.reset).toHaveBeenCalledOnce();
  });

  it("keeps the poll draft when submission returns false", async () => {
    mocks.active = true;
    mocks.valid = true;
    mocks.submit.mockResolvedValue(false);
    expect(await renderComposer().submit()).toBe(false);
    expect(mocks.reset).not.toHaveBeenCalled();
    expect(mocks.closeAllPopups).not.toHaveBeenCalled();
  });

  it("keeps the poll draft when submission throws", async () => {
    mocks.active = true;
    mocks.valid = true;
    mocks.submit.mockRejectedValue(new Error("offline"));
    await expect(renderComposer().submit()).rejects.toThrow("offline");
    expect(mocks.reset).not.toHaveBeenCalled();
  });
});
