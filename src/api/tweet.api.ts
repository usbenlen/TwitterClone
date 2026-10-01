import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import {
  mapEditHistoryResponse,
  getMappedPosts,
  mapPostToTweet,
  type BackendEditHistoryResponse,
  type BackendPost,
} from "@/api/mappers/post.mapper";

import { MOCK_ENABLED } from "@/mock/config";
import { mockTweetApi } from "@/mock/handlers";

import type {
  CreateTweetRequest,
  UpdateTweetRequest,
  ToggleBookmarkResponse,
  ToggleLikeResponse,
  ToggleRepostResponse,
} from "@/types/tweet";

const realTweetApi = {
  getAll: () => getMappedPosts(ENDPOINTS.posts.all),

  getFeed: () => getMappedPosts(ENDPOINTS.posts.feed),

  getBookmarked: () => getMappedPosts(ENDPOINTS.posts.bookmarked),

  getLiked: () => getMappedPosts(ENDPOINTS.posts.liked),

  getReposted: () => getMappedPosts(ENDPOINTS.posts.reposted),

  getByUsername: (username: string) =>
    getMappedPosts(ENDPOINTS.posts.byUser(username)),

  getById: async (id: string) => {
    const post = await apiClient.get<BackendPost>(ENDPOINTS.posts.byId(id));

    return mapPostToTweet(post);
  },

  getEditHistory: async (id: string) => {
    const history = await apiClient.get<BackendEditHistoryResponse>(
      ENDPOINTS.posts.editHistory(id),
    );

    return mapEditHistoryResponse(history);
  },

  create: async (data: CreateTweetRequest) => {
    const post = await apiClient.post<BackendPost>(
      ENDPOINTS.posts.create,
      data,
    );

    return mapPostToTweet(post);
  },

  update: async (id: string, data: UpdateTweetRequest) => {
    const post = await apiClient.put<BackendPost>(
      ENDPOINTS.posts.update(id),
      data,
    );

    return mapPostToTweet(post);
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
    if (likedByMe) return realTweetApi.unlike(id);
    return realTweetApi.like(id);
  },

  toggleRepost: (
    id: string,
    repostedByMe: boolean,
  ): Promise<ToggleRepostResponse> => {
    if (repostedByMe) return realTweetApi.unrepost(id);
    return realTweetApi.repost(id);
  },

  toggleBookmark: (
    id: string,
    bookmarkedByMe: boolean,
  ): Promise<ToggleBookmarkResponse | undefined> => {
    if (bookmarkedByMe) return realTweetApi.unbookmark(id);
    return realTweetApi.bookmark(id);
  },
};

export const tweetApi = MOCK_ENABLED ? mockTweetApi : realTweetApi;
