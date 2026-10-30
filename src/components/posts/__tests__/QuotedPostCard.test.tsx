import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import PostContent from "@/components/posts/PostContent";

import type { Post } from "@/types/post";

const pollProps = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/useClickOrDrag", () => ({
  useClickOrDrag: () => ({})
}));
vi.mock("@/components/ui/Avatar", () => ({
  Avatar: () => null
}));
vi.mock("@/components/ui/TwemojiText", () => ({
  default: () => null
}));
vi.mock("@/components/profiles/VerifiedBadge", () => ({
  VerifiedBadge: () => null
}));
vi.mock("@/components/posts/PostPoll", () => ({
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
    } as unknown as Post;

    const post = {
      ...target,
      id: "quote",
      poll: undefined,
      quote: {
        targetType: "comment",
        targetId: target.id,
        target,
        hasNewVersion: false,
      },
    } as Post;

    renderToString(
      <MemoryRouter>
        <PostContent post={post} readOnly />
      </MemoryRouter>,
    );

    expect(pollProps).toHaveBeenCalledWith(
      expect.objectContaining({
        postId: target.id,
        poll: target.poll,
        isComment: true,
        readOnly: true,
      }),
    );
  });
});
