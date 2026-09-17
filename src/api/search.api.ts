import { ENDPOINTS } from "@/api/config";
import { apiClient } from "@/api/client";
import { mapPostToTweet, type BackendPost } from "@/api/mappers/post.mapper";

import { MOCK_ENABLED } from "@/mock/config";
import { mockSearchApi } from "@/mock/handlers";

import type {
  SearchCriteria,
  SearchViewerContext,
  Tweet,
  UserShort,
} from "@/types";

interface SearchApi {
  users(
    criteria: SearchCriteria,
    viewer?: SearchViewerContext,
  ): Promise<UserShort[]>;
  posts(
    criteria: SearchCriteria,
    viewer?: SearchViewerContext,
  ): Promise<Tweet[]>;
}

function buildSearchQuery(criteria: SearchCriteria, target: "posts" | "users") {
  const params = new URLSearchParams();

  if (criteria.query) params.set("q", criteria.query);
  if (criteria.people === "following") params.set("people", "following");
  if (criteria.location === "near") params.set("location", "near");

  if (target === "posts") {
    if (criteria.exactPhrase) params.set("exactPhrase", criteria.exactPhrase);
    if (criteria.anyWords) params.set("anyWords", criteria.anyWords);
    if (criteria.excludeWords) params.set("excludeWords", criteria.excludeWords);
    if (criteria.from) params.set("from", criteria.from);
    if (criteria.minReplies !== undefined) params.set("minReplies", String(criteria.minReplies));
    if (criteria.minLikes !== undefined) params.set("minLikes", String(criteria.minLikes));
    if (criteria.minReposts !== undefined) params.set("minReposts", String(criteria.minReposts));
    if (criteria.fromDate) params.set("fromDate", criteria.fromDate);
    if (criteria.toDate) params.set("toDate", criteria.toDate);
    if (criteria.hasMedia) params.set("hasMedia", "true");
  }

  return params.toString();
}

const realSearchApi: SearchApi = {
  users: (criteria: SearchCriteria) =>
    apiClient.get<UserShort[]>(
      `${ENDPOINTS.search.users}?${buildSearchQuery(criteria, "users")}`,
    ),

  posts: (criteria: SearchCriteria) =>
    apiClient
      .get<BackendPost[]>(
        `${ENDPOINTS.search.posts}?${buildSearchQuery(criteria, "posts")}`,
      )
      .then((posts): Tweet[] => posts.map(mapPostToTweet)),
};

export const searchApi: SearchApi = MOCK_ENABLED
  ? mockSearchApi
  : realSearchApi;
