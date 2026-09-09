import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import {
  mapInteractionCollection,
  mapPostToTweet,
  type BackendInteractionCollection,
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
  getFeed: async () => {
    const posts = await apiClient.get<BackendPost[]>(ENDPOINTS.posts.feed);

    return posts.map(mapPostToTweet);
  },

  getBookmarked: async () => {
    const collection = await apiClient.get<BackendInteractionCollection>(
      ENDPOINTS.posts.bookmarked,
    );

    return mapInteractionCollection(collection);
  },

  getLiked: async () => {
    const collection = await apiClient.get<BackendInteractionCollection>(
      ENDPOINTS.posts.liked,
    );

    return mapInteractionCollection(collection);
  },

  getReposted: async () => {
    const collection = await apiClient.get<BackendInteractionCollection>(
      ENDPOINTS.posts.reposted,
    );

    return mapInteractionCollection(collection);
  },

  getByUsername: async (username: string) => {
    const posts = await apiClient.get<BackendPost[]>(
      ENDPOINTS.posts.byUser(username),
    );

    return posts.map(mapPostToTweet);
  },

  getById: async (id: string) => {
    const post = await apiClient.get<BackendPost>(ENDPOINTS.posts.byId(id));

    return mapPostToTweet(post);
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
