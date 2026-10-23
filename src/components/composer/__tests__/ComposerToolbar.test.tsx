// @vitest-environment happy-dom
import { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ComposerToolbar from "@/components/composer/ComposerToolbar";
import { COMPOSER_ACTIONS } from "@/constants/composer";

vi.mock("@/constants/composer", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/constants/composer")>();
  return {
    ...actual,
    COMPOSER_ACTIONS: actual.COMPOSER_ACTIONS.map((action) => ({
      ...action,
      enabled: true,
    })),
  };
});

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("composer toolbar tooltips", () => {
  it.each(COMPOSER_ACTIONS)(
    "labels the $id action on hover without adding a layout wrapper",
    async (action) => {
      const onAction = vi.fn();
      await act(async () =>
        root.render(<ComposerToolbar onAction={onAction} />),
      );
      const button = container.querySelector<HTMLButtonElement>(
        `button[aria-label="${action.label}"]`,
      )!;
      expect(button.parentElement).toBe(container.firstElementChild);
      await act(async () => {
        button.dispatchEvent(
          new PointerEvent("pointerover", {
            pointerType: "mouse",
            bubbles: true,
          }),
        );
        button.dispatchEvent(new MouseEvent("mouseenter"));
        vi.advanceTimersByTime(450);
      });
      expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(
        action.label,
      );
      await act(async () => button.click());
      expect(onAction).toHaveBeenCalledExactlyOnceWith(action.id);
      expect(document.querySelector('[role="tooltip"]')).toBeNull();
    },
  );

  it("preserves object and callback refs, expanded states, and keyboard hints", async () => {
    const emojiRef = createRef<HTMLButtonElement>();
    const scheduleRef = vi.fn();
    await act(async () =>
      root.render(
        <ComposerToolbar
          onAction={vi.fn()}
          buttonRefs={{ emoji: emojiRef, schedule: scheduleRef }}
          showEmojiPicker
          activeActions={["poll"]}
        />,
      ),
    );
    const emoji = container.querySelector<HTMLButtonElement>(
      '[aria-label="Емодзі"]',
    )!;
    const schedule = container.querySelector<HTMLButtonElement>(
      '[aria-label="Запланувати"]',
    )!;
    expect(emojiRef.current).toBe(emoji);
    expect(scheduleRef).toHaveBeenLastCalledWith(schedule);
    expect(emoji.getAttribute("aria-expanded")).toBe("true");
    expect(
      container
        .querySelector('[aria-label="Опитування"]')
        ?.getAttribute("aria-expanded"),
    ).toBe("true");
    await act(async () => emoji.focus());
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(
      "Емодзі",
    );
    await act(async () =>
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
    );
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it("keeps disabled and hidden actions unavailable", async () => {
    const onAction = vi.fn();
    await act(async () =>
      root.render(
        <ComposerToolbar
          onAction={onAction}
          allowedActions={["emoji", "schedule", "gif"]}
          hiddenActions={["gif"]}
          disabledActions={["schedule"]}
        />,
      ),
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(2);
    const schedule = container.querySelector<HTMLButtonElement>(
      '[aria-label="Запланувати"]',
    )!;
    expect(schedule.disabled).toBe(true);
    await act(async () => {
      schedule.dispatchEvent(
        new PointerEvent("pointerover", {
          pointerType: "mouse",
          bubbles: true,
        }),
      );
      schedule.dispatchEvent(new MouseEvent("mouseenter"));
      vi.advanceTimersByTime(450);
      schedule.click();
    });
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(onAction).not.toHaveBeenCalled();
    await act(async () =>
      root.render(<ComposerToolbar onAction={onAction} disabled />),
    );
    expect(
      [...container.querySelectorAll("button")].every(
        (button) => button.disabled,
      ),
    ).toBe(true);
  });
});
