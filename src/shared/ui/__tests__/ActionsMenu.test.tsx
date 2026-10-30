// @vitest-environment happy-dom
import { Pencil, Trash2 } from "lucide-react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ActionsMenu } from "@/shared/ui/ActionsMenu";

import type { Root } from "react-dom/client";
import type { ActionsMenuItem } from "@/shared/ui/ActionsMenu";

let root: Root;
let host: HTMLDivElement;
const select = vi.fn();
const navigate = vi.fn();
const items: ActionsMenuItem[] = [
  { id: "edit", label: "Редагувати", icon: Pencil, onSelect: select },
  {
    id: "delete",
    label: "Видалити",
    icon: Trash2,
    variant: "danger",
    onSelect: select,
  },
];
const menu = () => document.querySelector('[role="menu"]');
const tooltip = () => document.querySelector('[role="tooltip"]');

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  select.mockClear();
  navigate.mockClear();
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

async function render(actions: readonly ActionsMenuItem[] = items) {
  await act(async () =>
    root.render(
      <div onClick={navigate}>
        <ActionsMenu
          items={actions}
          ariaLabel="Додаткові дії"
          menuLabel="Дії з дописом"
        />
      </div>,
    ),
  );
}

async function open() {
  const trigger = host.querySelector<HTMLButtonElement>(
    "[data-actions-menu-trigger]",
  )!;
  await act(async () => {
    trigger.focus();
    trigger.click();
  });
  return trigger;
}

async function hover(trigger: HTMLButtonElement, pointerType = "mouse") {
  await act(async () => {
    trigger.dispatchEvent(
      new PointerEvent("pointerover", { pointerType, bubbles: true }),
    );
    trigger.dispatchEvent(new MouseEvent("mouseenter"));
  });
}

describe("shared actions menu", () => {
  it("calls the selected item once, closes and stops card navigation", async () => {
    await render();
    const trigger = await open();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(menu()?.getAttribute("aria-label")).toBe("Дії з дописом");
    expect(menu()?.querySelectorAll('[role="menuitem"]')).toHaveLength(2);
    const item = menu()!.querySelector<HTMLButtonElement>('[role="menuitem"]')!;
    await act(async () => item.click());
    expect(select).toHaveBeenCalledOnce();
    expect(navigate).not.toHaveBeenCalled();
    expect(menu()).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("supports icon-free and disabled items and keeps destructive styling", async () => {
    await render([
      { id: "disabled", label: "Недоступно", disabled: true, onSelect: select },
      { id: "plain", label: "Звичайна дія", onSelect: select },
      items[1],
    ]);
    await open();
    const buttons =
      menu()!.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    expect(buttons[0].disabled).toBe(true);
    await act(async () => buttons[0].click());
    expect(select).not.toHaveBeenCalled();
    expect(menu()).not.toBeNull();
    expect(buttons[1].querySelector("svg")).toBeNull();
    expect(buttons[2].classList.contains("text-destructive")).toBe(true);
    await act(async () => buttons[1].click());
    expect(select).toHaveBeenCalledOnce();
  });

  it("closes with Escape and outside pointer down without executing actions", async () => {
    await render();
    const trigger = await open();
    await act(async () =>
      document.activeElement!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      ),
    );
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger);
    await open();
    await act(async () =>
      document.body.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true }),
      ),
    );
    expect(menu()).toBeNull();
    expect(select).not.toHaveBeenCalled();
  });

  it("hides an empty menu and removes an open menu when its actions disappear", async () => {
    await render([]);
    expect(host.querySelector("button")).toBeNull();
    await render();
    await open();
    await render([]);
    expect(host.querySelector("button")).toBeNull();
    expect(menu()).toBeNull();
    await render();
    expect(menu()).toBeNull();
  });

  it("shows Більше after 450ms and suppresses the tooltip while the menu is open", async () => {
    vi.useFakeTimers();
    await render();
    const trigger = host.querySelector<HTMLButtonElement>("button")!;
    await hover(trigger);
    await act(async () => vi.advanceTimersByTime(449));
    expect(tooltip()).toBeNull();
    await act(async () => vi.advanceTimersByTime(1));
    expect(tooltip()?.textContent).toBe("Більше");
    await act(async () => trigger.click());
    expect(menu()).not.toBeNull();
    expect(tooltip()).toBeNull();
    await hover(trigger);
    await act(async () => vi.advanceTimersByTime(1000));
    expect(tooltip()).toBeNull();
    expect(menu()).not.toBeNull();
  });

  it("shows the tooltip for keyboard focus and ignores touch hover", async () => {
    vi.useFakeTimers();
    await render();
    const trigger = host.querySelector<HTMLButtonElement>("button")!;
    await hover(trigger, "touch");
    await act(async () => vi.advanceTimersByTime(1000));
    expect(tooltip()).toBeNull();
    await act(async () => trigger.focus());
    expect(tooltip()?.textContent).toBe("Більше");
  });
});
