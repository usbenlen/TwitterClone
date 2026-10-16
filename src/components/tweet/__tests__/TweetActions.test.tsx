// @vitest-environment happy-dom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import TweetActions from "@/components/tweet/TweetActions";

vi.mock("@/components/tweet/repost/index", () => ({
  RepostMenu: () => null,
}));

describe("tweet actions layout", () => {
  it("spaces actions on mobile and groups the first three on desktop", () => {
    const html = renderToStaticMarkup(
      <TweetActions
        likedByMe={false}
        likesCount={525200}
        repostedByMe={false}
        repliesCount={54400}
        retweetsCount={77700}
        viewsCount={142000000}
        bookmarkedByMe={false}
        onComment={vi.fn()}
        onRepost={vi.fn()}
        onQuote={vi.fn()}
        onLike={vi.fn()}
        onBookmark={vi.fn()}
      />,
    );
    const document = new DOMParser().parseFromString(html, "text/html");
    const counts = [...document.querySelectorAll("span")];

    expect(counts.map((span) => span.textContent)).toEqual([
      "54.4K",
      "77.7K",
      "525.2K",
      "142M",
    ]);
    const actions = document.querySelector(".justify-between");
    expect(actions?.classList.contains("sm:justify-start")).toBe(true);
    const actionButtons = [...document.querySelectorAll("button")].filter(
      (button) => button.querySelector("svg"),
    );
    expect(actionButtons).toHaveLength(4);
    expect(actionButtons.slice(0, 3).map((button) => button.textContent)).toEqual([
      "54.4K",
      "77.7K",
      "525.2K",
    ]);
    expect(document.querySelector(".sm\\:ml-auto")).not.toBeNull();
  });
});
