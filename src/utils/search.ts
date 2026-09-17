import type { SearchCriteria, SearchType } from "@/types";

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

function optionalNonNegativeInteger(value: string | null) {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function validDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  return Number.isNaN(new Date(`${value}T00:00:00`).getTime()) ? "" : value;
}

export function parseSearchCriteria(params: URLSearchParams): SearchCriteria {
  return {
    query: params.get("q")?.trim() ?? "",
    type: params.get("type") === "users" ? "users" : "posts",
    people: params.get("people") === "following" ? "following" : "anyone",
    location: params.get("location") === "near" ? "near" : "anywhere",
    exactPhrase: params.get("exactPhrase")?.trim() ?? "",
    anyWords: params.get("anyWords")?.trim() ?? "",
    excludeWords: params.get("excludeWords")?.trim() ?? "",
    from: params.get("from")?.trim().replace(/^@+/, "") ?? "",
    minReplies: optionalNonNegativeInteger(params.get("minReplies")),
    minLikes: optionalNonNegativeInteger(params.get("minLikes")),
    minReposts: optionalNonNegativeInteger(params.get("minReposts")),
    fromDate: validDate(params.get("fromDate")),
    toDate: validDate(params.get("toDate")),
    hasMedia: params.get("hasMedia") === "true",
  };
}

export function serializeSearchCriteria(criteria: SearchCriteria) {
  const params = new URLSearchParams();

  if (criteria.query.trim()) params.set("q", criteria.query.trim());
  params.set("type", criteria.type);
  if (criteria.people === "following") params.set("people", "following");
  if (criteria.location === "near") params.set("location", "near");
  if (criteria.exactPhrase.trim()) params.set("exactPhrase", criteria.exactPhrase.trim());
  if (criteria.anyWords.trim()) params.set("anyWords", criteria.anyWords.trim());
  if (criteria.excludeWords.trim()) params.set("excludeWords", criteria.excludeWords.trim());
  if (criteria.from.trim()) params.set("from", criteria.from.trim().replace(/^@+/, ""));
  if (criteria.minReplies !== undefined) params.set("minReplies", String(criteria.minReplies));
  if (criteria.minLikes !== undefined) params.set("minLikes", String(criteria.minLikes));
  if (criteria.minReposts !== undefined) params.set("minReposts", String(criteria.minReposts));
  if (criteria.fromDate) params.set("fromDate", criteria.fromDate);
  if (criteria.toDate) params.set("toDate", criteria.toDate);
  if (criteria.hasMedia) params.set("hasMedia", "true");

  return params;
}

export function hasAdvancedSearchCriteria(criteria: SearchCriteria) {
  return Boolean(
    criteria.exactPhrase ||
    criteria.anyWords ||
    criteria.excludeWords ||
    criteria.from ||
    criteria.minReplies !== undefined ||
    criteria.minLikes !== undefined ||
    criteria.minReposts !== undefined ||
    criteria.fromDate ||
    criteria.toDate ||
    criteria.hasMedia,
  );
}

export function hasActiveSearchCriteria(criteria: SearchCriteria) {
  return Boolean(
    criteria.query ||
    criteria.people === "following" ||
    criteria.location === "near" ||
    (criteria.type === "posts" && hasAdvancedSearchCriteria(criteria)),
  );
}

export function hasNonDefaultFilters(criteria: SearchCriteria) {
  return (
    criteria.people !== "anyone" ||
    criteria.location !== "anywhere" ||
    hasAdvancedSearchCriteria(criteria)
  );
}

export function criteriaForType(criteria: SearchCriteria, type: SearchType) {
  if (type === "posts") return { ...criteria, type };

  return {
    ...DEFAULT_SEARCH_CRITERIA,
    query: criteria.query,
    type,
    people: criteria.people,
    location: criteria.location,
  };
}
