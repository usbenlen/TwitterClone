// @vitest-environment happy-dom
import { act, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TrendsList } from "@/components/recommendations/TrendsList";
import { TREND_FEEDBACK_OPTIONS } from "@/constants/trendFeedback";

const topics = [
  { id: "a", title: "Тема A", context: "Популярне", query: "topic a" },
  { id: "b", title: "Тема B", context: "Популярне", query: "topic b" },
];
let host: HTMLDivElement;
let root: Root;
const selected = vi.fn();

function Probe({
  single = false,
  actions = true,
}: {
  single?: boolean;
  actions?: boolean;
}) {
  const [trends, setTrends] = useState(single ? topics.slice(0, 1) : topics);
  const fallbackRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  return (
    <>
      <button ref={fallbackRef}>Популярне</button>
      <TrendsList
        trends={trends}
        reload={vi.fn()}
        numbered
        onDismiss={
          actions
            ? (id, reason) => {
                selected(id, reason);
                setTrends((previous) =>
                  previous.filter((trend) => trend.id !== id),
                );
              }
            : undefined
        }
        onEmptyFocus={() => fallbackRef.current?.focus()}
      />
      <output>
        {location.pathname}
        {location.search}
      </output>
    </>
  );
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  selected.mockClear();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

async function render(single = false, actions = true) {
  await act(async () =>
    root.render(
      <MemoryRouter initialEntries={["/explore?tab=trending"]}>
        <Probe single={single} actions={actions} />
      </MemoryRouter>,
    ),
  );
}

async function openMenu() {
  const trigger = host.querySelector<HTMLButtonElement>(
    "[data-actions-menu-trigger]",
  )!;
  await act(async () => {
    trigger.focus();
    trigger.click();
  });
  return trigger;
}

describe("trend actions", () => {
  it.each(TREND_FEEDBACK_OPTIONS)(
    "dismisses the topic using $reason without navigating",
    async ({ reason, label }) => {
      await render();
      await openMenu();
      const items = [
        ...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
      ];
      expect(items).toHaveLength(6);
      await act(async () =>
        items.find((item) => item.textContent?.trim() === label)!.click(),
      );
      expect(selected).toHaveBeenCalledWith("a", reason);
      expect(host.querySelector("a")?.textContent).toContain("Тема B");
      expect(host.querySelector("a")?.textContent).not.toContain("Тема A");
      expect(host.querySelector("a")?.textContent).toContain("1 ·");
      expect(host.querySelector("output")?.textContent).toBe(
        "/explore?tab=trending",
      );
      expect(document.querySelector('[role="menu"]')).toBeNull();
      expect(document.activeElement).toBe(
        host.querySelector("[data-actions-menu-trigger]"),
      );
    },
  );

  it("closes on Escape without dismissing and returns focus to its trigger", async () => {
    await render();
    const trigger = await openMenu();
    await act(async () => {
      document.activeElement!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(selected).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes on outside pointer down and leaves the list intact", async () => {
    await render();
    await openMenu();
    await act(async () =>
      document.body.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true }),
      ),
    );
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(host.querySelectorAll("a")).toHaveLength(2);
  });

  it("focuses the active tab when the last visible topic is removed", async () => {
    await render(true);
    await openMenu();
    await act(async () =>
      (
        document.querySelector('[role="menuitem"]') as HTMLButtonElement
      ).click(),
    );
    expect(host.querySelectorAll("a")).toHaveLength(0);
    expect(document.activeElement).toBe(host.querySelector("button"));
  });

  it("keeps other trend lists as ordinary search links without an actions trigger", async () => {
    await render(false, false);
    expect(host.querySelector("[data-actions-menu-trigger]")).toBeNull();
    expect(host.querySelectorAll("a")).toHaveLength(2);
    expect(host.querySelector("a button")).toBeNull();
  });
});
