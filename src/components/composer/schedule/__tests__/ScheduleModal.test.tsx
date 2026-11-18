// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ScheduleModal from "@/components/composer/schedule/ScheduleModal";

let root: Root;
let host: HTMLDivElement;
const now = new Date(2028, 1, 28, 10, 20, 30);
const initial = new Date(2028, 1, 29, 12, 35);
const onApply = vi.fn();
const onOpenScheduledPosts = vi.fn();

const button = (label: string) =>
  Array.from(document.querySelectorAll("button")).find(
    (element) =>
      (element.getAttribute("aria-label") ?? element.textContent) === label,
  )!;

const calendarDay = (day: number) =>
  document.querySelector<HTMLButtonElement>(`[data-calendar-day="${day}"]`)!;

function setInput(label: string, value: string) {
  const input = document.querySelector<HTMLInputElement>(
    `input[aria-label="${label}"]`,
  )!;
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

async function render(initialAt = initial.toISOString()) {
  await act(async () =>
    root.render(
      <ScheduleModal
        open
        initialAt={initialAt}
        onClose={vi.fn()}
        onApply={onApply}
        onOpenScheduledPosts={onOpenScheduledPosts}
      />,
    ),
  );
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(now);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("schedule calendar", () => {
  it("applies a local day and time across a leap-month boundary", async () => {
    await render();
    expect(calendarDay(27).disabled).toBe(true);
    expect(calendarDay(29).getAttribute("aria-pressed")).toBe("true");
    expect(button("Попередній місяць").disabled).toBe(true);

    await act(async () => button("Наступний місяць").click());
    expect(calendarDay(1).tabIndex).toBe(0);
    await act(async () => {
      calendarDay(1).focus();
      calendarDay(1).dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
    });
    expect(document.activeElement).toBe(calendarDay(2));

    await act(async () => calendarDay(2).click());
    await act(async () => setInput("Години", "19"));
    await act(async () => setInput("Хвилини", "05"));
    await act(async () => button("Заплановані дописи").click());
    await act(async () => button("Застосувати").click());
    const expected = new Date(2028, 2, 2, 19, 5).toISOString();
    expect(onOpenScheduledPosts).toHaveBeenCalledWith(expected);
    expect(onApply).toHaveBeenCalledWith(expected);
  });

  it("rejects invalid and expired times without blocking access to the list", async () => {
    await render();
    await act(async () => setInput("Години", "24"));
    expect(button("Застосувати").disabled).toBe(true);
    expect(document.querySelector('[role="alert"]')).not.toBeNull();
    await act(async () => button("Заплановані дописи").click());
    expect(onOpenScheduledPosts).toHaveBeenCalledWith(null);

    await act(async () => setInput("Години", "12"));
    vi.setSystemTime(initial);
    await act(async () => button("Застосувати").click());
    expect(button("Застосувати").disabled).toBe(true);
    expect(onApply).not.toHaveBeenCalled();
  });
});
