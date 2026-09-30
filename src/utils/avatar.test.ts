import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { Avatar } from "@/ui/Avatar";
import { getAvatarGradient, getAvatarInitials } from "./avatar";

describe("avatar fallbacks", () => {
  it.each([
    ["Ada Lovelace", "AL"],
    ["Олена Коваль", "ОК"],
    ["😀 User Extra", "😀U"],
    ["alice", "A"],
  ])("uses at most two Unicode initials for %s", (name, expected) => {
    expect(getAvatarInitials(name)).toBe(expected);
  });

  it("preserves the existing gradient for a known user ID and username", () => {
    expect(getAvatarGradient("user-1")).toBe(
      "linear-gradient(to bottom right, color-mix(in oklab, var(--muted), var(--foreground) 8%), color-mix(in oklab, var(--muted), var(--foreground) 22%))",
    );
    expect(getAvatarGradient("alice")).toContain("to top left");
    expect(getAvatarGradient("alice")).toContain("22%");
  });

  it("keeps trimmed display-name precedence, username fallback and the default name", () => {
    const named = renderToString(
      createElement(Avatar, {
        name: "  Ada Lovelace  ",
        fallbackName: "alice",
        userId: "user-1",
      }),
    );
    expect(named).toContain('aria-label="Ada Lovelace"');
    expect(named).toContain(">AL</span>");
    expect(named).toContain(getAvatarGradient("user-1"));
    const fallback = renderToString(
      createElement(Avatar, { name: "  ", fallbackName: "  alice " }),
    );
    expect(fallback).toContain('aria-label="alice"');
    expect(renderToString(createElement(Avatar))).toContain(
      'aria-label="User"',
    );
  });
});
