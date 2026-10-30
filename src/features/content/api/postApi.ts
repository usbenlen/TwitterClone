import {
  getMappedInteractionPage,
  getMappedPostPage,
  getMappedPosts,
  mapBackendPost,
  mapEditHistoryResponse,
} from "@/features/content/api/mappers/postMapper";
import {
  mapCreatePostRequest,
  mapUpdateRequest,
} from "@/features/content/api/mappers/postRequestMapper";
import { ENDPOINTS, apiClient } from "@/shared/api";
import { MOCK_ENABLED } from "@/shared/config/mockConfig";
import { mockPostApi } from "@/mock/handlers/mockPostApi";

import type {
  BackendEditHistoryResponse,
  BackendPost,
  CreatePostRequest,
  ToggleBookmarkResponse,
  ToggleLikeResponse,
  ToggleRepostResponse,
  UpdatePostRequest,
} from "@/features/content/types";

const realPostApi = {
  getFeed: () => getMappedPosts(ENDPOINTS.posts.feed),

  getBookmarked: async () =>
    (await getMappedInteractionPage(ENDPOINTS.posts.bookmarked)).items,

  getLiked: async () =>
    (await getMappedInteractionPage(ENDPOINTS.posts.liked)).items,

  getReposted: async () =>
    (await getMappedInteractionPage(ENDPOINTS.posts.reposted)).items,

  getByUsername: async (username: string) =>
    (await getMappedPostPage(ENDPOINTS.posts.byUser(username))).items,

  getById: async (id: string) => {
    const post = await apiClient.get<BackendPost>(ENDPOINTS.posts.byId(id));

    return mapBackendPost(post);
  },

  getEditHistory: async (id: string) => {
    const history = await apiClient.get<BackendEditHistoryResponse>(
      ENDPOINTS.posts.editHistory(id),
    );

    return mapEditHistoryResponse(history);
  },

  create: async (data: CreatePostRequest) => {
    const post = await apiClient.post<BackendPost>(
      ENDPOINTS.posts.create,
      mapCreatePostRequest(data),
    );

    return mapBackendPost(post);
  },

  update: async (id: string, data: UpdatePostRequest) => {
    const post = await apiClient.put<BackendPost>(
      ENDPOINTS.posts.update(id),
      mapUpdateRequest(data),
    );

    return mapBackendPost(post);
  },

  delete: (id: string) => apiClient.delete(ENDPOINTS.posts.delete(id)),

  view: (id: string) => apiClient.post(ENDPOINTS.posts.view(id)),

  like: (id: string) =>
    apiClient.post<ToggleLikeResponse>(ENDPOINTS.posts.like(id)),
  unlike: (id: string) =>
    apiClient.delete<ToggleLikeResponse>(ENDPOINTS.posts.unlike(id)),
  repost: (id: string) =>
    apiClient.post<ToggleRepostResponse>(ENDPOINTS.posts.repost(id)),
  unrepost: (id: string) =>
    apiClient.delete<ToggleRepostResponse>(ENDPOINTS.posts.unrepost(id)),
  bookmark: (id: string) =>
    apiClient.post<ToggleBookmarkResponse | undefined>(
      ENDPOINTS.posts.bookmark(id),
    ),
  unbookmark: (id: string) =>
    apiClient.delete<ToggleBookmarkResponse | undefined>(
      ENDPOINTS.posts.unbookmark(id),
    ),

  toggleLike: (id: string, likedByMe: boolean): Promise<ToggleLikeResponse> => {
    if (likedByMe) return realPostApi.unlike(id);
    return realPostApi.like(id);
  },

  toggleRepost: (
    id: string,
    repostedByMe: boolean,
  ): Promise<ToggleRepostResponse> => {
    if (repostedByMe) return realPostApi.unrepost(id);
    return realPostApi.repost(id);
  },

  toggleBookmark: (
    id: string,
    bookmarkedByMe: boolean,
  ): Promise<ToggleBookmarkResponse | undefined> => {
    if (bookmarkedByMe) return realPostApi.unbookmark(id);
    return realPostApi.bookmark(id);
  },
};

export const postApi = MOCK_ENABLED ? mockPostApi : realPostApi;
