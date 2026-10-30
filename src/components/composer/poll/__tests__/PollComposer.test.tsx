// @vitest-environment happy-dom
import { act, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PollComposer from "@/components/composer/poll/PollComposer";
import { useComposerPoll } from "@/hooks/composer/useComposerPoll";
import { POLL } from "@/constants/poll";

let root: Root;
let container: HTMLDivElement;
let editor: ReturnType<typeof useComposerPoll>;
const remove = vi.fn();

function Harness({ disabled = false }: { disabled?: boolean }) {
  const pollEditor = useComposerPoll();
  useEffect(() => {
    editor = pollEditor;
  });
  return (
    <PollComposer
      poll={pollEditor.poll}
      firstOptionRef={pollEditor.firstOptionRef}
      isValid={pollEditor.isValid}
      disabled={disabled}
      onOptionChange={pollEditor.updateOption}
      onAddOption={pollEditor.addOption}
      onRemoveOption={pollEditor.removeOption}
      onDurationChange={pollEditor.setDuration}
      onRemove={remove}
    />
  );
}

function button(text: string) {
  return [...container.querySelectorAll("button")].find(
    (node) =>
      node.getAttribute("aria-label") === text ||
      node.textContent?.trim() === text,
  )!;
}

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<Harness />));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("poll editor interaction", () => {
  it("focuses added options, caps the list at four and returns focus after removal", async () => {
    expect(container.querySelectorAll('input:not([type="file"])')).toHaveLength(POLL.MIN_OPTIONS);
    expect(document.activeElement).toBe(container.querySelector('input:not([type="file"])'));
    expect(container.querySelector('[aria-label^="Видалити варіант"]')).toBeNull();
    expect(
      button("Додати варіант").parentElement?.parentElement?.querySelector(
        'input:not([type="file"])',
      ),
    ).toBe(container.querySelectorAll('input:not([type="file"])')[1]);

    await act(async () => button("Додати варіант").click());

    expect(document.activeElement).toBe(container.querySelectorAll('input:not([type="file"])')[2]);
    expect(
      button("Додати варіант").parentElement?.parentElement?.querySelector(
        'input:not([type="file"])',
      ),
    ).toBe(container.querySelectorAll('input:not([type="file"])')[2]);

    await act(async () => button("Додати варіант").click());

    expect(container.querySelectorAll('input:not([type="file"])')).toHaveLength(POLL.MAX_OPTIONS);
    expect(document.activeElement).toBe(container.querySelectorAll('input:not([type="file"])')[3]);
    expect(button("Додати варіант")).toBeUndefined();

    await act(async () =>
      container
        .querySelector<HTMLButtonElement>('[aria-label="Видалити варіант 4"]')!
        .click(),
    );

    expect(document.activeElement).toBe(container.querySelectorAll('input:not([type="file"])')[2]);
    expect(container.querySelectorAll('input:not([type="file"])')).toHaveLength(3);
    expect(button("Додати варіант")).toBeDefined();
  });

  it("keeps Unicode counting and the existing option limit", async () => {
    const option = editor.poll.options[0];
    await act(async () =>
      editor.updateOption(option.id, "😀".repeat(POLL.MAX_OPTION_LENGTH + 1)),
    );
    const input = container.querySelector<HTMLInputElement>(
      'input:not([type="file"])',
    )!;

    expect(input.value).toBe("😀".repeat(POLL.MAX_OPTION_LENGTH));
    expect(input.hasAttribute("maxlength")).toBe(false);
    expect(input.closest("label")?.textContent).toContain("25/25");
  });

  it("sets duration through the compact fields and respects the seven-day maximum", async () => {
    const [days, hours, minutes] = container.querySelectorAll("select");
    const change = (field: HTMLSelectElement, value: string) =>
      act(async () => {
        field.value = value;
        field.dispatchEvent(new Event("change", { bubbles: true }));
      });
    await change(days, "0");
    await change(hours, "1");
    expect(editor.poll.duration).toBe(60);
    await change(minutes, "15");
    expect(editor.poll.duration).toBe(75);
    await change(days, "7");
    expect(editor.poll.duration).toBe(POLL.MAX_DURATION_MINUTES);
    expect([days.value, hours.value, minutes.value]).toEqual(["7", "0", "0"]);
    expect(hours.disabled && minutes.disabled).toBe(true);
    await change(days, "1");
    expect(hours.disabled || minutes.disabled).toBe(false);
    expect(editor.poll.duration).toBe(POLL.DEFAULT_DURATION_MINUTES);
  });

  it("keeps invalid durations unpostable and disables editing while busy", async () => {
    await act(async () => {
      editor.updateOption(editor.poll.options[0].id, "Так");
      editor.updateOption(editor.poll.options[1].id, "Ні");
      editor.setDuration(POLL.MIN_DURATION_MINUTES - 1);
    });
    expect(editor.isValid).toBe(false);
    expect(container.querySelector('input:not([type="file"])')?.getAttribute("aria-describedby")).toBeTruthy();
    await act(async () => editor.setDuration(POLL.MIN_DURATION_MINUTES));
    expect(editor.isValid).toBe(true);
    await act(async () => button("Видалити опитування").click());
    expect(remove).toHaveBeenCalledOnce();
    await act(async () => root.render(<Harness disabled />));
    expect(
      [...container.querySelectorAll("input, select, button")].every(
        (node) => (node as HTMLInputElement).disabled,
      ),
    ).toBe(true);
  });
});
