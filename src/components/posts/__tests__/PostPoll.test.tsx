// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PostPoll from "@/components/posts/PostPoll";

import type { PostPoll as Poll } from "@/types/poll";

const hooks = vi.hoisted(() => ({
  loading: false,
  expired: false,
  vote: vi.fn(),
  usePollVote: vi.fn(),
}));
vi.mock("@/hooks/posts/usePollVote", () => ({
  usePollVote: (id: string, poll: Poll, isComment: boolean) => {
    hooks.usePollVote(id, poll, isComment);
    return { poll, loading: hooks.loading, vote: hooks.vote };
  }
}));
vi.mock("@/hooks/posts/usePollCountdown", () => ({
  usePollCountdown: () => ({ expired: hooks.expired, text: "1 год" })
}));

const poll: Poll = {
  id: "poll",
  totalVotes: 1,
  isClosed: false,
  expiresAt: "2099-01-01T00:00:00Z",
  options: [
    { id: "yes", text: "Так", votesCount: 1 },
    { id: "no", text: "Ні", votesCount: 0 },
  ],
};

beforeEach(() => {
  hooks.loading = false;
  hooks.expired = false;
  hooks.usePollVote.mockClear();
});

describe("poll display states", () => {
  it("shows photos and Twemoji before voting and keeps both in results", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const withPhoto = {
      ...poll,
      options: [
        {
          ...poll.options[0],
          text: "Так 😀",
          media: {
            id: "photo",
            type: "image" as const,
            url: "https://example.com/photo.png",
          },
        },
        poll.options[1],
      ],
    };

    try {
      await act(async () =>
        root.render(<PostPoll postId="post" poll={withPhoto} />),
      );

      expect(container.querySelector('img[src="https://example.com/photo.png"]')).not.toBeNull();
      expect(container.querySelector("img.twemoji")?.getAttribute("alt")).toBe(
        "😀",
      );

      hooks.vote.mockReset().mockResolvedValue(true);

      await act(async () =>
        container
          .querySelector<HTMLImageElement>(
            'img[src="https://example.com/photo.png"]',
          )!
          .click(),
      );

      expect(hooks.vote).toHaveBeenCalledExactlyOnceWith("yes");

      await act(async () =>
        root.render(
          <PostPoll
            postId="post"
            poll={{ ...withPhoto, votedOptionId: "yes" }}
          />,
        ),
      );

      expect(
        container
          .querySelector('[aria-pressed="true"] img')
          ?.getAttribute("src"),
      ).toBe("https://example.com/photo.png");
      expect(container.textContent).toContain("100%");

    } finally {
      await act(async () => root.unmount());
      container.remove();
      vi.unstubAllGlobals();
    }
  });

  it("lets a failed vote be retried and clears its error", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    hooks.vote
      .mockReset()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    try {
      await act(async () =>
        root.render(<PostPoll postId="post" poll={poll} />),
      );
      await act(async () => container.querySelector("button")!.click());
      expect(hooks.vote).toHaveBeenLastCalledWith("yes");
      expect(container.querySelector('[role="alert"]')?.textContent).toContain(
        "Спробуйте ще раз",
      );
      await act(async () => container.querySelector("button")!.click());
      expect(hooks.vote).toHaveBeenCalledTimes(2);
      expect(container.querySelector('[role="alert"]')).toBeNull();
    } finally {
      await act(async () => root.unmount());
      container.remove();
      vi.unstubAllGlobals();
    }
  });
  it.each([
    [0, "0 голосів"],
    [1, "1 голос"],
    [2, "2 голоси"],
    [5, "5 голосів"],
    [11, "11 голосів"],
    [21, "21 голос"],
    [22, "22 голоси"],
  ])("formats %i votes correctly", (count, label) => {
    const html = renderToString(
      <PostPoll
        postId="post"
        poll={{ ...poll, totalVotes: Number(count) }}
      />,
    );
    expect(html).toContain(label);
  });

  it("shows buttons and hides results before voting", () => {
    const html = renderToString(<PostPoll postId="post" poll={poll} />);
    expect(html).toContain("Голосувати за Так");
    expect(html).not.toContain("disabled=");
    expect(html).not.toContain("width:");
  });

  it("renders zero and full-width results and identifies the selected option", () => {
    const html = renderToString(
      <PostPoll postId="post" poll={{ ...poll, votedOptionId: "yes" }} />,
    );
    expect(html).toContain("width:0%");
    expect(html).toContain("width:100%");
    expect(html).toContain("ваш голос");
    expect(html).toContain('aria-pressed="true"');
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });

  it("shows 0% for every option when there are no votes", () => {
    const html = renderToString(
      <PostPoll postId="post" poll={{ ...poll, totalVotes: 0 }} readOnly />,
    );
    expect(html.match(/width:0%/g)).toHaveLength(2);
  });

  it.each(["server", "countdown"])(
    "shows a finished state when closed by %s",
    (source) => {
      hooks.expired = source === "countdown";
      const html = renderToString(
        <PostPoll
          postId="post"
          poll={{ ...poll, isClosed: source === "server" }}
        />,
      );
      expect(html).toContain("Опитування завершене");
      expect(html).not.toContain("Залишилось");
      expect(html.match(/disabled=""/g)).toHaveLength(2);
    },
  );

  it("disables repeated voting while pending and targets comments correctly", () => {
    hooks.loading = true;
    const html = renderToString(
      <PostPoll postId="comment" poll={poll} isComment />,
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Надсилаємо голос");
    expect(html.match(/disabled=""/g)).toHaveLength(2);
    expect(hooks.usePollVote).toHaveBeenCalledWith("comment", poll, true);
  });
});
