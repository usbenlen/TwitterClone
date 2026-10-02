import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import TweetContent from "@/components/tweet/TweetContent";
import type { Tweet } from "@/types";

const pollProps = vi.hoisted(() => vi.fn());
vi.mock("@/hooks", () => ({ useClickOrDrag: () => ({}) }));
vi.mock("@/ui/index", () => ({ Avatar: () => null, TwemojiText: () => null }));
vi.mock("@/components/tweet/poll/TweetPoll", () => ({
  default: (props: unknown) => {
    pollProps(props);
    return null;
  },
}));

describe("quoted polls", () => {
  it("preserves read-only mode and uses comment voting targets", () => {
    const target = {
      id: "comment",
      content: "Question",
      isComment: true,
      attachments: [],
      createdAt: "2026-01-01T00:00:00Z",
      author: { id: "user", username: "user", displayName: "User" },
      poll: {
        id: "poll",
        options: [],
        totalVotes: 0,
        expiresAt: "2099-01-01",
        isClosed: false,
      },
    } as unknown as Tweet;
    const tweet = {
      ...target,
      id: "quote",
      poll: undefined,
      quote: {
        targetType: "comment",
        targetId: target.id,
        target,
        hasNewVersion: false,
      },
    } as Tweet;
    renderToString(
      <MemoryRouter>
        <TweetContent tweet={tweet} readOnly />
      </MemoryRouter>,
    );
    expect(pollProps).toHaveBeenCalledWith(
      expect.objectContaining({
        tweetId: target.id,
        poll: target.poll,
        isComment: true,
        readOnly: true,
      }),
    );
  });
});
