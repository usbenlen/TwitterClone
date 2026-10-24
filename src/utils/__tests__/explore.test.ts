import { describe, expect, it } from "vitest";

import { filterExploreTrends, parseExploreTab } from "@/utils/explore";
import type { TrendRecommendation } from "@/types/recommendations";

const trend = (
  id: string,
  title: string,
  context = "",
): TrendRecommendation => ({ id, title, context, query: id });

describe("Explore categories", () => {
  it("uses normalized titles and contexts, preserving the server order", () => {
    const trends = [
      trend("1", "Новини ФУТБОЛУ"),
      trend("2", "Final", "ＳＰＯＲＴＳ"),
      trend("3", "React"),
    ];
    expect(filterExploreTrends(trends, "sports")).toEqual(trends.slice(0, 2));
    expect(filterExploreTrends(trends, "news")).toEqual([trends[0]]);
    expect(trends).toHaveLength(3);
  });

  it("allows overlapping categories without manufacturing unmatched topics", () => {
    const trends = [trend("1", "Music news"), trend("2", "TypeScript")];
    expect(filterExploreTrends(trends, "news")).toEqual([trends[0]]);
    expect(filterExploreTrends(trends, "entertainment")).toEqual([trends[0]]);
    expect(filterExploreTrends(trends, "sports")).toEqual([]);
    expect(filterExploreTrends([], "news")).toEqual([]);
  });

  it("only accepts known URL tabs", () => {
    expect(parseExploreTab("sports")).toBe("sports");
    expect(parseExploreTab("trending")).toBe("trending");
    expect(parseExploreTab(null)).toBe("overview");
    expect(parseExploreTab("unknown")).toBe("overview");
  });
});
