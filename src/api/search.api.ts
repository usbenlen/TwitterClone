/** @format */

import { ENDPOINTS } from "@/api/config";
import { apiClient } from "@/api/client";

import type { BackendPost } from "@/api/mappers/post.mapper";
import type { UserShort } from "@/types/user";

import { MOCK_ENABLED } from "@/mock/config";
import { mockSearchApi } from "@/mock/handlers";

const realSearchApi = {
  users: (query: string) =>
    apiClient.get<UserShort[]>(
      `${ENDPOINTS.search.users}?q=${encodeURIComponent(query)}`,
    ),

  posts: (query: string) =>
    apiClient.get<BackendPost[]>(
      `${ENDPOINTS.search.posts}?q=${encodeURIComponent(query)}`,
    ),
};

export const searchApi = MOCK_ENABLED ? mockSearchApi : realSearchApi;

//Наступним кроком я б зробив навігацію з результату пошуку: клік по користувачу → /profile/:username, клік по допису → сторінка/модалка конкретного допису. Це вже буде завершувати весь search flow.
