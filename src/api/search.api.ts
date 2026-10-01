import { serializeSearchApiCriteria } from "@/utils/search";
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

const realSearchApi: SearchApi = {
  users: (criteria: SearchCriteria) =>
    apiClient.get<UserShort[]>(
      `${ENDPOINTS.search.users}?${serializeSearchApiCriteria(criteria, "users")}`,
    ),

  posts: (criteria: SearchCriteria) =>
    apiClient
      .get<BackendPost[]>(
        `${ENDPOINTS.search.posts}?${serializeSearchApiCriteria(criteria, "posts")}`,
      )
      .then((posts): Tweet[] => posts.map(mapPostToTweet)),
};

export const searchApi: SearchApi = MOCK_ENABLED
  ? mockSearchApi
  : realSearchApi;
