// @vitest-environment happy-dom
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import TweetHeader from "@/components/tweet/TweetHeader";

import type { Tweet } from "@/types";

vi.mock("@/components/tweet", () => ({ ActionsMenu: () => null }));
vi.mock("@/ui/VerifiedBadge", () => ({ VerifiedBadge: () => null }));

const author: Tweet["author"] = {
  id: "user-1",
  username: "olena",
  displayName: "Олена",
  isVerified: false,
};

function render(onOpenEditHistory?: () => void) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <TweetHeader
        author={author}
        createdAt="2026-10-16T09:30:00.000Z"
        updatedAt="2026-10-16T09:45:00.000Z"
        onOpenEditHistory={onOpenEditHistory}
      />
    </MemoryRouter>,
  );
}

describe("edited post indicator", () => {
  it("shows a prominent pen-line button to open edit history without visible text", () => {
    const html = render(vi.fn());
    const document = new DOMParser().parseFromString(html, "text/html");
    const button = document.querySelector<HTMLButtonElement>("button");

    expect(button?.getAttribute("aria-label")).toBe(
      "Відкрити історію редагувань",
    );
    expect(button?.getAttribute("title")).toBe("Відредаговано");
    const icon = button?.querySelector<SVGSVGElement>("svg.lucide-pen-line");
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("width")).toBe("17");
    expect(icon?.getAttribute("stroke-width")).toBe("2.5");
    expect(button?.textContent?.trim()).toBe("");
  });

  it("keeps the non-interactive pencil indicator accessible", () => {
    const html = render();
    const document = new DOMParser().parseFromString(html, "text/html");
    const indicator = document.querySelector('[aria-label="Відредаговано"]');

    expect(indicator?.querySelector("svg.lucide-pen-line")).not.toBeNull();
    expect(indicator?.textContent?.trim()).toBe("");
  });
});
