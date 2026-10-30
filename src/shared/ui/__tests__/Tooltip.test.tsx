// @vitest-environment happy-dom
import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Tooltip } from "@/shared/ui/Tooltip";

import type { Root } from "react-dom/client";

let root: Root;
let container: HTMLDivElement;
const tooltip = () => document.querySelector('[role="tooltip"]');

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

async function hover(button: HTMLButtonElement, pointerType = "mouse") {
  await act(async () => {
    button.dispatchEvent(
      new PointerEvent("pointerover", { pointerType, bubbles: true }),
    );
    button.dispatchEvent(new MouseEvent("mouseenter"));
  });
}

describe("action tooltips", () => {
  it("can disable an existing tooltip without disabling its child", async () => {
    const render = (disabled: boolean) => (
      <Tooltip label="Більше" disabled={disabled}>
        <button>Меню</button>
      </Tooltip>
    );
    await act(async () => root.render(render(false)));
    const button = container.querySelector("button")!;
    await hover(button);
    await act(async () => vi.advanceTimersByTime(450));
    expect(tooltip()).not.toBeNull();
    await act(async () => root.render(render(true)));
    expect(tooltip()).toBeNull();
    expect(button.disabled).toBe(false);
    await hover(button);
    await act(async () => vi.advanceTimersByTime(1000));
    expect(tooltip()).toBeNull();
  });

  it("waits on hover, preserves refs and handlers, and adds no layout wrapper", async () => {
    const ref = createRef<HTMLButtonElement>();
    const click = vi.fn();
    await act(async () =>
      root.render(
        <Tooltip label="Репостнути">
          <button ref={ref} onClick={click} aria-haspopup="menu">
            Репост
          </button>
        </Tooltip>,
      ),
    );
    const button = container.querySelector("button")!;
    expect(container.firstElementChild).toBe(button);
    expect(ref.current).toBe(button);
    expect(button.getAttribute("aria-haspopup")).toBe("menu");
    await hover(button);
    await act(async () => vi.advanceTimersByTime(449));
    expect(tooltip()).toBeNull();
    await act(async () => vi.advanceTimersByTime(1));
    expect(tooltip()?.textContent).toBe("Репостнути");
    expect(button.getAttribute("aria-describedby")).toBe(tooltip()?.id);
    await act(async () => button.click());
    expect(click).toHaveBeenCalledOnce();
    expect(tooltip()).toBeNull();
    await act(async () => root.unmount());
    expect(ref.current).toBeNull();
    root = createRoot(container);
  });

  it("opens on keyboard focus, updates the action label, and closes on Escape", async () => {
    const render = (label: string) => (
      <Tooltip label={label}>
        <button>Дія</button>
      </Tooltip>
    );
    await act(async () => root.render(render("Вподобати")));
    await act(async () => container.querySelector("button")!.focus());
    expect(tooltip()?.textContent).toBe("Вподобати");
    await act(async () => root.render(render("Скасувати вподобання")));
    expect(tooltip()?.textContent).toBe("Скасувати вподобання");
    await act(async () =>
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
    );
    expect(tooltip()).toBeNull();
  });

  it("does not show a tooltip for touch hover or a disabled action", async () => {
    await act(async () =>
      root.render(
        <Tooltip label="Коментувати">
          <button>Дія</button>
        </Tooltip>,
      ),
    );
    await hover(container.querySelector("button")!, "touch");
    await act(async () => vi.advanceTimersByTime(1000));
    expect(tooltip()).toBeNull();
    await act(async () =>
      root.render(
        <Tooltip label="Коментувати">
          <button disabled>Дія</button>
        </Tooltip>,
      ),
    );
    await hover(container.querySelector("button")!);
    await act(async () => vi.advanceTimersByTime(1000));
    expect(tooltip()).toBeNull();
  });

  it("dismisses when the pointer leaves", async () => {
    await act(async () =>
      root.render(
        <Tooltip label="Перегляди">
          <button>Дія</button>
        </Tooltip>,
      ),
    );
    const button = container.querySelector("button")!;
    await hover(button);
    await act(async () => vi.advanceTimersByTime(450));
    expect(tooltip()).not.toBeNull();
    await act(async () =>
      button.dispatchEvent(
        new MouseEvent("mouseleave", { relatedTarget: document.body }),
      ),
    );
    expect(tooltip()).toBeNull();
  });
});
