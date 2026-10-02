import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TweetPoll from "@/components/tweet/poll/TweetPoll";
import type { TweetPoll as Poll } from "@/types/poll";

const hooks = vi.hoisted(() => ({
  loading: false,
  expired: false,
  vote: vi.fn(),
  usePollVote: vi.fn(),
}));
vi.mock("@/hooks", () => ({
  usePollVote: (id: string, poll: Poll, isComment: boolean) => {
    hooks.usePollVote(id, poll, isComment);
    return { poll, loading: hooks.loading, vote: hooks.vote };
  },
  usePollCountdown: () => ({ expired: hooks.expired, text: "1 год" }),
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
      <TweetPoll
        tweetId="post"
        poll={{ ...poll, totalVotes: Number(count) }}
      />,
    );
    expect(html).toContain(label);
  });
  it("shows buttons and hides results before voting", () => {
    const html = renderToString(<TweetPoll tweetId="post" poll={poll} />);
    expect(html).toContain("Голосувати за Так");
    expect(html).not.toContain("disabled=");
    expect(html).not.toContain("width:");
  });
  it("renders zero and full-width results and identifies the selected option", () => {
    const html = renderToString(
      <TweetPoll tweetId="post" poll={{ ...poll, votedOptionId: "yes" }} />,
    );
    expect(html).toContain("width:0%");
    expect(html).toContain("width:100%");
    expect(html).toContain("ваш голос");
    expect(html).toContain('aria-pressed="true"');
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });
  it("shows 0% for every option when there are no votes", () => {
    const html = renderToString(
      <TweetPoll tweetId="post" poll={{ ...poll, totalVotes: 0 }} readOnly />,
    );
    expect(html.match(/width:0%/g)).toHaveLength(2);
  });
  it.each(["server", "countdown"])(
    "shows a finished state when closed by %s",
    (source) => {
      hooks.expired = source === "countdown";
      const html = renderToString(
        <TweetPoll
          tweetId="post"
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
      <TweetPoll tweetId="comment" poll={poll} isComment />,
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Надсилаємо голос");
    expect(html.match(/disabled=""/g)).toHaveLength(2);
    expect(hooks.usePollVote).toHaveBeenCalledWith("comment", poll, true);
  });
});
