// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import TweetHeader from "@/components/tweet/TweetHeader";

vi.mock("@/ui/VerifiedBadge", () => ({ VerifiedBadge: () => null }));

const author = {
  id: "u1",
  username: "viewer",
  displayName: "Користувач",
  isVerified: false,
};
let root: Root;
let host: HTMLDivElement;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

async function render(actions: {
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}) {
  await act(async () =>
    root.render(
      <MemoryRouter>
        <TweetHeader
          author={author}
          createdAt="2026-10-01T00:00:00Z"
          {...actions}
        />
      </MemoryRouter>,
    ),
  );
}

describe("post actions through the shared menu", () => {
  it.each([
    ["onEdit", "Редагувати"],
    ["onDelete", "Видалити"],
    ["onReport", "Поскаржитися"],
  ] as const)("only exposes the supplied %s action", async (name, label) => {
    const action = vi.fn();
    await render({ [name]: action });
    await act(async () =>
      host
        .querySelector<HTMLButtonElement>("[data-actions-menu-trigger]")!
        .click(),
    );
    const items =
      document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    expect(items).toHaveLength(1);
    expect(items[0].textContent?.trim()).toBe(label);
    await act(async () => items[0].click());
    expect(action).toHaveBeenCalledOnce();
  });

  it("does not show an actions trigger when no callbacks are supplied", async () => {
    await render({});
    expect(host.querySelector("[data-actions-menu-trigger]")).toBeNull();
  });
});
