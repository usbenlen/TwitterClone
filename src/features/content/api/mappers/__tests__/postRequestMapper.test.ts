import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  mapCreatePostRequest,
  mapUpdateRequest,
} from "@/features/content/api/mappers/postRequestMapper";

const location = {
  id: "kyiv",
  name: "Kyiv",
  country: "Ukraine",
  latitude: 50.45,
  longitude: 30.52,
};

describe("API request mapping", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-09T10:00:00Z"));
  });

  afterEach(() => vi.useRealTimers());

  it("maps a composer poll to the backend endsAt contract", () => {
    expect(
      mapCreatePostRequest({
        content: "Hello",
        mediaIds: [],
        poll: { options: ["Так", "Ні"], duration: 60 },
      }),
    ).toMatchObject({
      poll: {
        options: ["Так", "Ні"],
        endsAt: "2026-10-09T11:00:00.000Z",
      },
    });
  });

  it("uses an explicit remove flag without restoring stale metadata", () => {
    const payload = mapUpdateRequest({
      content: "Updated",
      mediaIds: [],
      location: null,
    });

    expect(payload).toMatchObject({
      content: "Updated",
      mediaIds: [],
      removeLocation: true,
    });
    expect(payload).not.toHaveProperty("location");
  });

  it("passes option media IDs through create and update without sending local files", () => {
    const poll = {
      options: [{ text: "Так 😀", mediaId: "photo" }, { text: "Ні" }],
      duration: 60,
    };

    for (const map of [mapCreatePostRequest, mapUpdateRequest]) {
      const payload = map({ content: "Питання", mediaIds: [], poll });

      expect(payload.poll).toEqual({
        options: poll.options,
        endsAt: "2026-10-09T11:00:00.000Z",
      });
      expect(payload.mediaIds).toEqual([]);
    }

    expect(mapUpdateRequest({ content: "Текст" })).not.toHaveProperty("poll");
    expect(mapUpdateRequest({ poll: null })).toMatchObject({ removePoll: true, });
  });

  it("rejects conflicting update commands before sending a request", () => {
    expect(() =>
      mapUpdateRequest({
        removeLocation: true,
        location,
      }),
    ).toThrow("одночасно оновити й видалити локацію");
  });
});
