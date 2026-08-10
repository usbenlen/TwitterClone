/** @format */
import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import type { CreateTweetRequest } from "@/types/tweet";
import { MOCK_ENABLED } from "@/mock/config";
import { mockTweetApi } from "@/mock/handlers";

import { mapPostToTweet, type BackendPost } from "@/api/mappers/post.mapper";

type ToggleLikeResponse = {
  likedByMe: boolean;
  likesCount: number;
};

type ToggleRepostResponse = {
  repostedByMe: boolean;
  repostsCount: number;
};

const realTweetApi = {
  getAll: async () => {
    const posts = await apiClient.get<BackendPost[]>(ENDPOINTS.posts.all);

    return posts.map(mapPostToTweet);
  },

  getFeed: async () => {
    const posts = await apiClient.get<BackendPost[]>(ENDPOINTS.posts.feed);

    return posts.map(mapPostToTweet);
  },

  getLiked: async () => {
    const posts = await apiClient.get<BackendPost[]>(ENDPOINTS.posts.liked);

    return posts.map(mapPostToTweet);
  },

  getReposted: async () => {
    const posts = await apiClient.get<BackendPost[]>(
      ENDPOINTS.posts.reposted,
    );

    return posts.map(mapPostToTweet);
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

  update: async (id: string, data: Partial<CreateTweetRequest>) => {
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
};

export const tweetApi = MOCK_ENABLED ? mockTweetApi : realTweetApi;
