import { serializeSearchApiCriteria } from "@/utils/search";
import { ENDPOINTS } from "@/api/config";
import { apiClient } from "@/api/client";
import { mapPostToTweet, type BackendPost } from "@/api/mappers/post.mapper";

import { MOCK_ENABLED } from "@/mock/config";
import { mockSearchApi } from "@/mock/handlers";

import type {
  SearchCriteria,
  SearchViewerContext,
  CursorPage,
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
    apiClient.get<CursorPage<UserShort>>(
      `${ENDPOINTS.search.users}?${serializeSearchApiCriteria(criteria, "users")}`,
    ).then((page) => page.items),

  posts: (criteria: SearchCriteria) =>
    apiClient
      .get<CursorPage<BackendPost>>(
        `${ENDPOINTS.search.posts}?${serializeSearchApiCriteria(criteria, "posts")}`,
      )
      .then((page): Tweet[] => page.items.map(mapPostToTweet)),
};

export const searchApi: SearchApi = MOCK_ENABLED
  ? mockSearchApi
  : realSearchApi;
