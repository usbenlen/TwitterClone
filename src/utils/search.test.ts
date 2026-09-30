import { describe, expect, it } from "vitest";
import { DEFAULT_SEARCH_CRITERIA } from "@/constants/search";
import {
  criteriaForType,
  parseSearchCriteria,
  serializeSearchCriteria,
} from "./search";

describe("search filter compatibility", () => {
  it("switches to users with shared defaults while retaining query, people and location", () => {
    const criteria = criteriaForType(
      {
        ...DEFAULT_SEARCH_CRITERIA,
        query: "React",
        people: "following",
        location: "near",
        exactPhrase: "React 19",
        minLikes: 10,
        hasMedia: true,
      },
      "users",
    );
    expect(criteria).toEqual({
      ...DEFAULT_SEARCH_CRITERIA,
      query: "React",
      people: "following",
      location: "near",
      type: "users",
    });
    expect(DEFAULT_SEARCH_CRITERIA.type).toBe("posts");
    expect(DEFAULT_SEARCH_CRITERIA.query).toBe("");
  });

  it("preserves filter URLs when criteria pass through serialization and parsing", () => {
    const criteria = {
      ...DEFAULT_SEARCH_CRITERIA,
      query: "React",
      people: "following" as const,
      location: "near" as const,
      exactPhrase: "React 19",
      minLikes: 10,
      hasMedia: true,
      fromDate: "2026-01-01",
      toDate: "2026-09-30",
    };
    expect(
      parseSearchCriteria(
        new URLSearchParams(serializeSearchCriteria(criteria)),
      ),
    ).toEqual({
      ...criteria,
      minReplies: undefined,
      minReposts: undefined,
    });
  });
});
