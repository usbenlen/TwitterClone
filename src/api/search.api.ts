/** @format */

import { ENDPOINTS } from "@/api/config";
import { apiClient } from "@/api/client";

import { mapPostToTweet, type BackendPost } from "@/api/mappers/post.mapper";

import type { Tweet, UserShort } from "@/types";

import { MOCK_ENABLED } from "@/mock/config";
import { mockSearchApi } from "@/mock/handlers";

const realSearchApi = {
  users: (query: string) =>
    apiClient.get<UserShort[]>(
      `${ENDPOINTS.search.users}?q=${encodeURIComponent(query)}`,
    ),

  posts: (query: string) =>
    apiClient
      .get<
        BackendPost[]
      >(`${ENDPOINTS.search.posts}?q=${encodeURIComponent(query)}`)
      .then((posts): Tweet[] => posts.map(mapPostToTweet)),
};

export const searchApi = MOCK_ENABLED ? mockSearchApi : realSearchApi;
