import { describe, expect, it } from "vitest";
import {
  buildComposerPayload,
  buildScheduledPostPayload,
  canScheduleMedia,
  hasComposerChanges,
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
  it("trims submitted content and excludes files that have not been uploaded", () => {
    expect(
      buildComposerPayload({
        content: " hello ",
        media: [media, { ...media, attachmentId: undefined }],
        poll: {
          options: [
            { id: "1", text: " Yes " },
            { id: "2", text: " " },
          ],
          duration: 30,
        },
      }),
    ).toMatchObject({
      content: "hello",
      mediaIds: ["uploaded"],
      poll: { options: ["Yes"], duration: 30 },
    });
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
  it("only allows uploaded images or a single uploaded video/GIF for scheduling", () => {
    expect(canScheduleMedia([])).toBe(true);
    expect(canScheduleMedia([media])).toBe(true);
    expect(canScheduleMedia([{ ...media, type: "gif" }])).toBe(true);
    expect(canScheduleMedia([{ ...media, status: "uploading" }])).toBe(false);
    expect(canScheduleMedia([media, { ...media, type: "video" }])).toBe(false);
  });
});
