import { describe, expect, it } from "vitest";
import {
  countCharacters,
  getDisabledComposerActions,
  getMediaAdditionError,
  getMediaError,
  getPollError,
  getPostRulesError,
} from "@/utils/composerRules";

const image = { type: "image" as const };
const video = { type: "video" as const };
const gif = { type: "gif" as const };
const state = {
  media: [],
  hasPoll: false,
  hasLocation: false,
  scheduled: false,
  canSchedule: true,
  busy: false,
};

describe("composer rules", () => {
  it("counts Unicode code points and actual URL length", () => {
    expect(countCharacters("ї😀𐐀")).toBe(3);
    expect(countCharacters("https://example.com")).toBe(19);
    expect(
      getPostRulesError({ content: "😀".repeat(280), media: [] }),
    ).toBeNull();
    expect(
      getPostRulesError({ content: "ї".repeat(281), media: [] }),
    ).toContain("280");
  });
  it("accepts four mixed files and one standalone GIF", () => {
    expect(getMediaError([image, video, image, video])).toBeNull();
    expect(getMediaError([video, video, video, video])).toBeNull();
    expect(getMediaError([gif])).toBeNull();
    expect(
      getMediaAdditionError([image, video, image, video], "image"),
    ).toContain("4");
    expect(getMediaError([gif, gif])).toContain("GIF");
    expect(getMediaAdditionError([image], "gif")).toContain("GIF");
    expect(getMediaAdditionError([gif], "video")).toContain("GIF");
  });
  it.each([4, 0, 10081, 1.5, NaN, Infinity])(
    "rejects poll duration %s",
    (duration) => {
      expect(getPollError(["Yes", "No"], duration)).not.toBeNull();
    },
  );
  it.each([5, 1440, 10080])("accepts poll duration %s", (duration) => {
    expect(getPollError(["Yes", "No"], duration)).toBeNull();
  });
  it("validates filled options, Unicode length and maximum number of rows", () => {
    expect(getPollError([" Yes ", "No", "", " "], 1440)).toBeNull();
    expect(getPollError(["😀".repeat(25), "No"], 5)).toBeNull();
    expect(getPollError(["😀".repeat(26), "No"], 5)).toContain("25");
    expect(getPollError(["Yes", " "], 5)).not.toBeNull();
    expect(getPollError(["1", "2", "3", "4"], 5)).toBeNull();
    expect(getPollError(["1", "2", "3", "4", ""], 5)).not.toBeNull();
    expect(
      getPostRulesError({
        content: "",
        media: [image],
        poll: { options: ["Yes", "No"], duration: 5 },
      }),
    ).toContain("Медіа та опитування");
  });
  it("disables only conflicting actions and restores them when attachments are removed", () => {
    expect(getDisabledComposerActions(state)).toEqual([]);
    expect(getDisabledComposerActions({ ...state, hasPoll: true })).toEqual([
      "image",
      "video",
      "gif",
      "poll",
      "schedule",
    ]);
    expect(getDisabledComposerActions({ ...state, media: [image] })).toEqual([
      "gif",
      "poll",
    ]);
    expect(getDisabledComposerActions({ ...state, media: [gif] })).toEqual([
      "image",
      "video",
      "gif",
      "poll",
    ]);
    expect(getDisabledComposerActions({ ...state, hasLocation: true })).toEqual(
      ["location", "schedule"],
    );
    expect(getDisabledComposerActions({ ...state, scheduled: true })).toEqual([
      "poll",
      "location",
    ]);
    expect(getDisabledComposerActions({ ...state, busy: true })).toHaveLength(
      7,
    );
    expect(
      getDisabledComposerActions({
        ...state,
        media: [image, video, image, video],
      }),
    ).toEqual(["image", "video", "gif", "poll"]);
  });
});
