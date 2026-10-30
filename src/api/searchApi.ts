import { serializeSearchApiCriteria } from "@/utils/searchCriteria";

import { ENDPOINTS } from "@/api/apiEndpoints";
import { apiClient } from "@/api/httpClient";
import { mapBackendPost } from "@/api/mappers/postMapper";
import { mapUserRole } from "@/api/mappers/profileMapper";

import type {
  BackendPost,
  BackendUser,
  SearchCriteria,
  SearchViewerContext,
  CursorPage,
  Post,
  UserShort,
} from "@/types";

import { MOCK_ENABLED } from "@/config/mockConfig";
import { mockSearchApi } from "@/mock/handlers/mockSearchApi";

interface SearchApi {
  users(
    criteria: SearchCriteria,
    viewer?: SearchViewerContext,
  ): Promise<UserShort[]>;
  posts(
    criteria: SearchCriteria,
    viewer?: SearchViewerContext,
  ): Promise<Post[]>;
}

const realSearchApi: SearchApi = {
  users: (criteria: SearchCriteria) =>
    apiClient
      .get<CursorPage<BackendUser<UserShort>>>(
        `${ENDPOINTS.search.users}?${serializeSearchApiCriteria(criteria, "users")}`,
      )
      .then((page) => page.items.map(mapUserRole)),

  posts: (criteria: SearchCriteria) =>
    apiClient
      .get<CursorPage<BackendPost>>(
        `${ENDPOINTS.search.posts}?${serializeSearchApiCriteria(criteria, "posts")}`,
      )
      .then((page): Post[] => page.items.map(mapBackendPost)),
};

export const searchApi: SearchApi = MOCK_ENABLED
  ? mockSearchApi
  : realSearchApi;
