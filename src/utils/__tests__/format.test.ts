import { describe, expect, it } from "vitest";

import { formatCount } from "@/utils/format";

describe("formatCount", () => {
  it.each([
    [0, "0"],
    [999, "999"],
    [1000, "1K"],
    [45200, "45.2K"],
    [999949, "999.9K"],
    [999950, "1M"],
    [1_000_000, "1M"],
    [999_950_000, "1B"],
    [1_420_000_000, "1.4B"],
  ])("formats %i as %s", (count, expected) => {
    expect(formatCount(count)).toBe(expected);
  });
});
