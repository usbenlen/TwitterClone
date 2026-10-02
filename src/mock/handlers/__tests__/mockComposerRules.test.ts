// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  CreateScheduledPostRequest,
  MediaAttachment,
  ScheduledMediaInput,
} from "@/types";

const mocks = vi.hoisted(() => ({
  stored: new Map<
    string,
    {
      blob: Blob;
      type: MediaAttachment["type"];
      mimeType: string;
      sizeInBytes: number;
    }
  >(),
  put: vi.fn(),
}));
vi.mock("@/mock/utils/delay", () => ({ delay: async () => {} }));
vi.mock("@/mock/stores/scheduledMediaStore", () => ({
  scheduledMediaStore: {
    put: mocks.put,
    get: async (id: string) => mocks.stored.get(id),
    removeMany: async (ids: string[]) =>
      ids.forEach((id) => mocks.stored.delete(id)),
  },
}));
async function load() {
  const { mockTweetApi } = await import("@/mock/handlers/mockTweetApi");
  const { mockCommentApi } = await import("@/mock/handlers/mockCommentApi");
  const { mockScheduledPostApi } =
    await import("@/mock/handlers/mockScheduledPostApi");
  const { mediaStore } = await import("@/mock/stores/mediaStore");
  const posts = await import("@/mock/data/tweets");
  for (const [id, type] of [
    ["image", "image"],
    ["video", "video"],
    ["gif", "gif"],
  ] as const) {
    mediaStore.add({
      id,
      type,
      url: `https://example.com/${id}`,
      mimeType: `${type === "video" ? "video" : "image"}/${type === "gif" ? "gif" : type === "video" ? "mp4" : "png"}`,
      sizeInBytes: 1,
    });
  }
  return {
    mockTweetApi,
    mockCommentApi,
    mockScheduledPostApi,
    mediaStore,
    posts,
  };
}
const poll = { options: ["Так", "Ні"], duration: 5 };
const location = {
  id: "kyiv",
  name: "Київ",
  country: "Україна",
  latitude: 50.45,
  longitude: 30.52,
};
beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  mocks.stored.clear();
  mocks.put
    .mockReset()
    .mockImplementation(async (input: ScheduledMediaInput) => {
      mocks.stored.set(input.attachmentId, {
        blob: input.file,
        type: input.type,
        mimeType: input.file.type,
        sizeInBytes: input.file.size,
      });
    });
});

describe("mock composer validation", () => {
  it.each([
    { content: "x".repeat(281), mediaIds: [] },
    { content: "", mediaIds: ["image"], poll },
    { content: "", mediaIds: ["gif", "video"] },
    { content: "", mediaIds: ["image", "video", "image", "video", "image"] },
    { content: "", mediaIds: [], poll: { ...poll, duration: 4 } },
    { content: "", mediaIds: [], poll: { ...poll, duration: 10081 } },
    {
      content: "",
      mediaIds: [],
      poll: { ...poll, options: ["x".repeat(26), "No"] },
    },
    { content: "", mediaIds: ["missing"] },
  ])(
    "rejects an invalid direct post request before storing it: %j",
    async (request) => {
      const backend = await load();
      const before = backend.posts.tweets;
      await expect(backend.mockTweetApi.create(request)).rejects.toThrow();
      expect(backend.posts.tweets).toBe(before);
    },
  );
  it("allows media/quote/location and poll/quote/location with one quoted target", async () => {
    const { mockTweetApi } = await load();
    const target = await mockTweetApi.create({
      content: "Original",
      mediaIds: [],
    });
    const mediaQuote = await mockTweetApi.create({
      content: "",
      mediaIds: ["image", "video"],
      quotedPostId: target.id,
      location,
    });
    const pollQuote = await mockTweetApi.create({
      content: "",
      mediaIds: [],
      quotedPostId: target.id,
      poll,
      location,
    });
    expect(mediaQuote.attachments).toHaveLength(2);
    expect(mediaQuote.quote?.targetId).toBe(target.id);
    expect(mediaQuote.location).toEqual(location);
    expect(pollQuote.poll?.options).toHaveLength(2);
    expect(pollQuote.quote?.targetId).toBe(target.id);
    await expect(
      mockTweetApi.create({
        content: "",
        mediaIds: [],
        quotedPostId: target.id,
        quotedCommentId: "c1",
      }),
    ).rejects.toThrow("один матеріал");
  });
  it("validates the complete post after partial edits and preserves it on rejection", async () => {
    const { mockTweetApi } = await load();
    const created = await mockTweetApi.create({
      content: "",
      mediaIds: ["image"],
    });
    await expect(mockTweetApi.update(created.id, { poll })).rejects.toThrow(
      "Медіа та опитування",
    );
    expect(await mockTweetApi.getById(created.id)).toEqual(created);
    const withPoll = await mockTweetApi.update(created.id, {
      mediaIds: [],
      poll,
    });
    await expect(
      mockTweetApi.update(created.id, { mediaIds: ["video"] }),
    ).rejects.toThrow("Медіа та опитування");
    expect(await mockTweetApi.getById(created.id)).toEqual(withPoll);
    const withVideo = await mockTweetApi.update(created.id, {
      mediaIds: ["video"],
      poll: null,
    });
    expect(withVideo.poll).toBeUndefined();
    expect(withVideo.attachments[0].type).toBe("video");
  });
  it("applies the same validation to comment creation and partial updates", async () => {
    const { mockTweetApi, mockCommentApi } = await load();
    const root = await mockTweetApi.create({
      content: "Original",
      mediaIds: [],
    });
    await expect(
      mockCommentApi.create({
        postId: root.id,
        content: "",
        mediaIds: ["image"],
        poll,
      }),
    ).rejects.toThrow("Медіа та опитування");
    const created = await mockCommentApi.create({
      postId: root.id,
      content: "",
      poll,
      location,
    });
    await expect(
      mockCommentApi.update(created.id, { mediaIds: ["image"] }),
    ).rejects.toThrow("Медіа та опитування");
    expect((await mockCommentApi.getThread(created.id)).target.poll?.id).toBe(
      created.poll?.id,
    );
    const updated = await mockCommentApi.update(created.id, {
      mediaIds: ["image"],
      poll: null,
    });
    expect(updated.attachments).toHaveLength(1);
    expect(updated.poll).toBeUndefined();
  });
  it("accepts Unicode boundaries and trims/discards blank poll options", async () => {
    const { mockTweetApi } = await load();
    const created = await mockTweetApi.create({
      content: "😀".repeat(280),
      mediaIds: [],
      poll: { duration: 10080, options: [" 😀 ", "Ні", "", " "] },
    });
    expect(created.poll?.options.map((option) => option.text)).toEqual([
      "😀",
      "Ні",
    ]);
    await expect(
      mockTweetApi.update(created.id, {
        poll: { options: ["Yes", "No"], duration: 0 },
      }),
    ).rejects.toThrow("Тривалість");
  });
  it("validates scheduled mixed media, preserves rejected edits and publishes after a reload", async () => {
    const { mockScheduledPostApi, mediaStore } = await load();
    const mockMedia = [
      {
        attachmentId: "image",
        type: "image" as const,
        file: new File(["image"], "image.png", { type: "image/png" }),
      },
      {
        attachmentId: "video",
        type: "video" as const,
        file: new File(["video"], "video.mp4", { type: "video/mp4" }),
      },
    ];
    const request = {
      content: "Later",
      mediaIds: ["image", "video"],
      scheduledAt: new Date(Date.now() - 1000).toISOString(),
      mockMedia,
    };
    const created = await mockScheduledPostApi.create(request);
    const writes = mocks.put.mock.calls.length;
    await expect(
      mockScheduledPostApi.update(created.id, {
        ...request,
        mediaIds: ["gif", "video"],
      }),
    ).rejects.toThrow("GIF");
    expect((await mockScheduledPostApi.list())[0].mediaIds).toEqual([
      "image",
      "video",
    ]);
    expect(mocks.put).toHaveBeenCalledTimes(writes);
    mediaStore.clear();
    const published = await mockScheduledPostApi.publishDue();
    expect(published[0].attachments.map((item) => item.type)).toEqual([
      "image",
      "video",
    ]);
    expect(await mockScheduledPostApi.list()).toEqual([]);
  });
  it.each(["poll", "location", "quotedPostId"])(
    "rejects unsupported %s in a direct schedule request",
    async (field) => {
      const { mockScheduledPostApi } = await load();
      const request = {
        content: "Later",
        mediaIds: [],
        scheduledAt: "2099-01-01T00:00:00Z",
        [field]:
          field === "poll" ? poll : field === "location" ? location : "t1",
      } as CreateScheduledPostRequest;
      await expect(mockScheduledPostApi.create(request)).rejects.toThrow(
        "Запланований пост",
      );
      expect(await mockScheduledPostApi.list()).toEqual([]);
    },
  );
});
