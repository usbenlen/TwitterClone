import type { SearchCriteria } from "@/types";

export const SEARCH_NEARBY_RADIUS_KM = 50;

export const DEFAULT_SEARCH_CRITERIA: SearchCriteria = {
  query: "",
  type: "posts",
  people: "anyone",
  location: "anywhere",
  exactPhrase: "",
  anyWords: "",
  excludeWords: "",
  from: "",
  fromDate: "",
  toDate: "",
  hasMedia: false,
};
