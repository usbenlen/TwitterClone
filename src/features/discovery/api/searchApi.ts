import { mapBackendPost } from "@/features/content/api/mappers/postMapper";
import { serializeSearchApiCriteria } from "@/features/discovery/lib/searchCriteria";
import { mapUserRole } from "@/features/profiles/api/mappers/profileMapper";
import { ENDPOINTS, apiClient } from "@/shared/api";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";
import { mockSearchApi } from "@/mock/handlers/mockSearchApi";

import type { BackendPost, Post } from "@/features/content/types";
import type {
  SearchCriteria,
  SearchViewerContext,
} from "@/features/discovery/types";
import type { BackendUser, UserShort } from "@/features/profiles/types";
import type { CursorPage } from "@/shared/types";

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
