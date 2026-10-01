import type { SearchCriteria, SearchType } from "@/types/index";
import { DEFAULT_SEARCH_CRITERIA } from "@/constants/search";

export { DEFAULT_SEARCH_CRITERIA };

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

  const entries = {
    q: criteria.query.trim(),
    type: criteria.type,
    people: criteria.people === "following" && criteria.people,
    location: criteria.location === "near" && criteria.location,
    exactPhrase: criteria.exactPhrase.trim(),
    anyWords: criteria.anyWords.trim(),
    excludeWords: criteria.excludeWords.trim(),
    from: criteria.from.trim(),
    minReplies: criteria.minReplies,
    minLikes: criteria.minLikes,
    minReposts: criteria.minReposts,
    fromDate: criteria.fromDate,
    toDate: criteria.toDate,
    hasMedia: criteria.hasMedia && "true",
  };

  for (const [key, value] of Object.entries(entries)) {
    if (value === undefined || value === "" || value === false) continue;
    params.set(
      key,
      key === "from" ? String(value).replace(/^@+/, "") : String(value),
    );
  }

  return params;
}

export function serializeSearchApiCriteria(
  criteria: SearchCriteria,
  target: SearchType,
) {
  const selected = criteriaForType(criteria, target);
  const params = serializeSearchCriteria(selected);
  params.delete("type");
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
