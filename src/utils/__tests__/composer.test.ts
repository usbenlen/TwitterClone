import { describe, expect, it } from "vitest";
import {
  buildComposerPayload,
  buildScheduledPostPayload,
  canScheduleMedia,
  hasComposerChanges,
  isComposerPollValid,
} from "@/utils/composer";
import type { ComposerMedia } from "@/types";

const media: ComposerMedia = {
  id: "preview",
  attachmentId: "uploaded",
  type: "image",
  status: "uploaded",
  previewUrl: "blob:preview",
  name: "photo",
  size: 5,
  progress: 100,
};
describe("composer data", () => {
  it("trims submitted content and poll options", () => {
    expect(
      buildComposerPayload({
        content: " hello ",
        media: [],
        poll: {
          options: [
            { id: "1", text: " Yes " },
            { id: "2", text: " No " },
            { id: "3", text: " " },
          ],
          duration: 30,
        },
      }),
    ).toMatchObject({
      content: "hello",
      mediaIds: [],
      poll: { options: ["Yes", "No"], duration: 30 },
    });
  });
  it.each([
    [[], false],
    [["", "   "], false],
    [["Yes", " "], false],
    [[" Yes ", "No"], true],
    [["Yes", "No", "", "   "], true],
    [["One", "Two", "Three", "Four"], true],
    [["One", "Two", "Three", "Four", "Five"], false],
  ] as const)("validates filled poll options %j", (texts, expected) => {
    expect(
      isComposerPollValid({
        options: texts.map((text, index) => ({ id: String(index), text })),
        duration: 1440,
      }),
    ).toBe(expected);
  });
  it("treats an added empty poll as a draft change", () => {
    expect(
      hasComposerChanges(
        {
          content: "",
          media: [],
          poll: {
            duration: 1440,
            options: [
              { id: "1", text: "" },
              { id: "2", text: "" },
            ],
          },
        },
        { content: "", media: [], poll: null },
      ),
    ).toBe(true);
  });
  it("keeps null for removing a poll and undefined for an untouched poll", () => {
    expect(
      buildComposerPayload({ content: "", media: [], poll: null }).poll,
    ).toBeNull();
    expect(
      buildComposerPayload({ content: "", media: [] }).poll,
    ).toBeUndefined();
  });
  it("builds scheduled data without poll/location and preserves mock files", () => {
    const file = new File(["photo"], "photo.png");
    const payload = buildScheduledPostPayload(
      {
        content: " later ",
        media: [{ ...media, file }],
        location: null,
        poll: null,
      },
      "2026-10-02T12:00:00Z",
    );
    expect(payload).toMatchObject({
      content: "later",
      mediaIds: ["uploaded"],
      mockMedia: [{ attachmentId: "uploaded", file, type: "image" }],
    });
    expect(payload).not.toHaveProperty("poll");
    expect(payload).not.toHaveProperty("location");
  });
  it("compares attachment identities while retaining raw text changes", () => {
    const initial = { content: "hello", media: [media] };
    expect(
      hasComposerChanges(
        {
          ...initial,
          media: [{ ...media, previewUrl: "blob:other", progress: 90 }],
        },
        initial,
      ),
    ).toBe(false);
    expect(hasComposerChanges({ ...initial, content: "hello " }, initial)).toBe(
      true,
    );
  });
  it("allows uploaded mixed images/videos or a single uploaded GIF for scheduling", () => {
    expect(canScheduleMedia([])).toBe(true);
    expect(canScheduleMedia([media])).toBe(true);
    expect(canScheduleMedia([{ ...media, type: "gif" }])).toBe(true);
    expect(canScheduleMedia([{ ...media, status: "uploading" }])).toBe(false);
    expect(canScheduleMedia([media, { ...media, type: "video" }])).toBe(true);
    expect(canScheduleMedia([media, { ...media, type: "gif" }])).toBe(false);
  });
  it("rejects incompatible media/polls and incomplete uploads instead of silently dropping files", () => {
    expect(() =>
      buildComposerPayload({
        content: "",
        media: [{ ...media, attachmentId: undefined }],
      }),
    ).toThrow("завантаження");
    expect(() =>
      buildComposerPayload({
        content: "",
        media: [media],
        poll: {
          duration: 5,
          options: [
            { id: "1", text: "Yes" },
            { id: "2", text: "No" },
          ],
        },
      }),
    ).toThrow("Медіа та опитування");
  });
});
