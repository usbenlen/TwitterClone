import { describe, expect, it } from "vitest";

import {
  normalizeDisplayText,
  normalizeInlineDisplayText,
} from "@/shared/lib/displayText";

describe("multiline display text", () => {
  it.each([
    ["a" + " ".repeat(278) + "b", "a b"],
    ["a" + "\n".repeat(278) + "b", "a\n\nb"],
    ["a\n \t \n  \n b", "a\n\nb"],
    ["  a \t\n  b  ", "a\nb"],
    ["a\r\nb\rc\u2028d\u2029e", "a\nb\nc\nd\ne"],
    ["a\t\t\u00a0\u2007\u202f\u3000b", "a b"],
    ["Один рядок\nДругий\n\nНовий абзац", "Один рядок\nДругий\n\nНовий абзац"],
    ["", ""],
    [" \t\r\n \u00a0\n", ""],
  ])("normalizes whitespace in %j", (text, expected) => {
    expect(normalizeDisplayText(text)).toBe(expected);
  });

  it("preserves Ukrainian letters, combining marks, zero-width characters and emoji sequences", () => {
    const text = "Ї й є ґ е\u0301 👩‍💻 🏳️‍🌈 👍🏽\u200b\u200c";
    expect(normalizeDisplayText(text)).toBe(text);
    expect(normalizeInlineDisplayText(text)).toBe(text);
  });

  it("keeps content of any length without truncation", () => {
    const text = "Довгий текст 😀 ".repeat(200).trim();
    expect(normalizeDisplayText(text)).toBe(text);
  });
});

describe("inline display text", () => {
  it.each([
    ["  Олена \t Коваль  ", "Олена Коваль"],
    ["a" + "\n \t".repeat(100) + "b", "a b"],
    ["a\r\n\u2028\u2029\u00a0b", "a b"],
    ["dev_user", "dev_user"],
    ["", ""],
    [" \n\t ", ""],
  ])("normalizes whitespace in %j", (text, expected) => {
    expect(normalizeInlineDisplayText(text)).toBe(expected);
  });
});
