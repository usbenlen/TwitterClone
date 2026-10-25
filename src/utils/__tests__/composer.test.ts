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
  it("keeps option images paired with trimmed text and out of post attachments", () => {
    const poll = {
      duration: 60,
      options: [
        { id: "1", text: " Так 😀 ", image: media },
        { id: "2", text: " Ні " },
      ],
    };

    expect(
      buildComposerPayload({ content: "Питання", media: [], poll }),
    ).toMatchObject({
      mediaIds: [],
      poll: {
        options: [{ text: "Так 😀", mediaId: "uploaded" }, { text: "Ні" }],
        duration: 60,
      },
    });

    expect(() =>
      buildComposerPayload({
        content: "Питання",
        media: [],
        poll: {
          ...poll,
          options: [
            { ...poll.options[0], image: { ...media, status: "uploading" } },
            poll.options[1],
          ],
        },
      }),
    ).toThrow("завантаження");
    expect(() =>
      buildComposerPayload({
        content: "Питання",
        media: [],
        poll: {
          ...poll,
          options: [...poll.options, { id: "3", text: "", image: media }],
        },
      }),
    ).toThrow("Додайте текст");
  });

  it("tracks image changes using identity rather than preview URLs", () => {
    const initial = {
      content: "",
      media: [],
      poll: {
        duration: 60,
        options: [
          { id: "1", text: "Так", image: media },
          { id: "2", text: "Ні" },
        ],
      },
    };

    const changed = (image?: ComposerMedia) => ({
      ...initial,
      poll: {
        ...initial.poll,
        options: [
          { ...initial.poll.options[0], image },
          initial.poll.options[1],
        ],
      },
    });

    expect(
      hasComposerChanges(
        changed({ ...media, previewUrl: "https://renewed-url" }),
        initial,
      ),
    ).toBe(false);
    expect(
      hasComposerChanges(changed({ ...media, attachmentId: "other" }), initial),
    ).toBe(true);
    expect(hasComposerChanges(changed(), initial)).toBe(true);
  });

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
