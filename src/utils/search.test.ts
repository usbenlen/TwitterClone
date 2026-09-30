import { describe, expect, it } from "vitest";
import { DEFAULT_SEARCH_CRITERIA } from "@/constants/search";
import {
  criteriaForType,
  parseSearchCriteria,
  serializeSearchCriteria,
} from "./search";
import type { SearchCriteria } from "@/types";

describe("search parameter serialization", () => {
  it.each<[string, Partial<SearchCriteria>, [string, string][]]>([
    ["defaults", {}, [["type", "posts"]]],
    ["user search", { type: "users" }, [["type", "users"]]],
    [
      "zero counters",
      { minReplies: 0, minLikes: 0, minReposts: 0 },
      [
        ["type", "posts"],
        ["minReplies", "0"],
        ["minLikes", "0"],
        ["minReposts", "0"],
      ],
    ],
    [
      "whitespace-only fields",
      {
        query: "  ",
        exactPhrase: "  ",
        anyWords: " ",
        excludeWords: " ",
        from: " ",
        minReplies: undefined,
        minLikes: undefined,
        minReposts: undefined,
      },
      [["type", "posts"]],
    ],
    [
      "handle containing only @",
      { from: " @@@ " },
      [
        ["type", "posts"],
        ["from", ""],
      ],
    ],
    [
      "all filters in stable order",
      {
        query: " React ",
        people: "following",
        location: "near",
        exactPhrase: " React 19 ",
        anyWords: " JS TS ",
        excludeWords: " bots ",
        from: " @@alice ",
        minReplies: 2,
        minLikes: 10,
        minReposts: 3,
        fromDate: "2026-01-01",
        toDate: "2026-09-30",
        hasMedia: true,
      },
      [
        ["q", "React"],
        ["type", "posts"],
        ["people", "following"],
        ["location", "near"],
        ["exactPhrase", "React 19"],
        ["anyWords", "JS TS"],
        ["excludeWords", "bots"],
        ["from", "alice"],
        ["minReplies", "2"],
        ["minLikes", "10"],
        ["minReposts", "3"],
        ["fromDate", "2026-01-01"],
        ["toDate", "2026-09-30"],
        ["hasMedia", "true"],
      ],
    ],
  ])("serializes %s", (_name, overrides, expected) => {
    expect([
      ...serializeSearchCriteria({ ...DEFAULT_SEARCH_CRITERIA, ...overrides }),
    ]).toEqual(expected);
  });

  it("round-trips every advanced filter including zero counters", () => {
    const criteria: SearchCriteria = {
      ...DEFAULT_SEARCH_CRITERIA,
      query: "React",
      people: "following",
      location: "near",
      exactPhrase: "React 19",
      anyWords: "JS TS",
      excludeWords: "bots",
      from: "alice",
      minReplies: 0,
      minLikes: 0,
      minReposts: 0,
      fromDate: "2026-01-01",
      toDate: "2026-09-30",
      hasMedia: true,
    };
    expect(parseSearchCriteria(serializeSearchCriteria(criteria))).toEqual(
      criteria,
    );
  });
});

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
