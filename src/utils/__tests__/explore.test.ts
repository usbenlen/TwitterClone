import { describe, expect, it } from "vitest";

import { parseExploreTab } from "@/utils/explore";

describe("Explore tabs", () => {
  it.each(["overview", "trending", "news", "sports", "entertainment"])("accepts the URL tab %s", (tab) => {
    expect(parseExploreTab(tab)).toBe(tab);
  });

  it("only accepts known URL tabs", () => {
    expect(parseExploreTab("sports")).toBe("sports");
    expect(parseExploreTab("trending")).toBe("trending");
    expect(parseExploreTab(null)).toBe("overview");
    expect(parseExploreTab("unknown")).toBe("overview");
  });
});
