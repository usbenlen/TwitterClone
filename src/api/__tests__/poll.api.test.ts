import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/api/client";
import { pollApi } from "@/api/poll.api";
import { ENDPOINTS } from "@/api/config";

vi.mock("@/mock/config", () => ({ MOCK_ENABLED: false }));
afterEach(() => vi.restoreAllMocks());

const poll = {
  id: "poll",
  postId: "target",
  endsAt: null,
  totalVotes: 3,
  hasVotedByCurrentUser: true,
  selectedOptionId: "a",
  options: [
    { id: "b", text: "Ні", position: 1, votesCount: 1 },
    { id: "a", text: "Так", position: 0, votesCount: 2 },
  ],
};

describe("live poll reads", () => {
  it("preserves option photos through reads and vote responses", async () => {
    const media = {
      id: "photo",
      type: "Image",
      mimeType: "image/png",
      url: "https://example.com/photo.png",
      fileName: "photo.png",
      sizeInBytes: 12,
      sortOrder: 0,
    };

    const response = {
      ...poll,
      options: [{ ...poll.options[0], media }, poll.options[1]],
    };

    vi.spyOn(apiClient, "get").mockResolvedValue({ poll: response });
    vi.spyOn(apiClient, "post").mockResolvedValue(response);

    expect((await pollApi.get("post", "target"))?.options[1].media)
      .toMatchObject({ id: "photo", type: "image", url: media.url });
    expect((await pollApi.vote("post", "target", "b")).options[1].media?.id).toBe("photo");
  });
  it.each(["post", "comment"] as const)(
    "reads a %s through its existing typed route",
    async (type) => {
      const get = vi
        .spyOn(apiClient, "get")
        .mockResolvedValueOnce(
          type === "post" ? { poll } : { target: { poll } },
        );
      const result = await pollApi.get(type, "target /?");
      expect(get).toHaveBeenCalledExactlyOnceWith(
        type === "post"
          ? ENDPOINTS.posts.byId("target /?")
          : ENDPOINTS.comments.thread("target /?"),
      );
      expect(result).toMatchObject({
        id: "poll",
        votedOptionId: "a",
        totalVotes: 3,
        expiresAt: null,
        isClosed: false,
      });
      expect(result!.options.map((option) => option.id)).toEqual(["a", "b"]);
    },
  );

  it("distinguishes a removed poll from a failed read", async () => {
    const get = vi
      .spyOn(apiClient, "get")
      .mockResolvedValueOnce({ poll: null });
    expect(await pollApi.get("post", "target")).toBeNull();
    const offline = new Error("offline");
    get.mockRejectedValueOnce(offline);
    await expect(pollApi.get("post", "target")).rejects.toBe(offline);
  });
});
