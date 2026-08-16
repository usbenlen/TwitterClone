import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import { mapPostToTweet, type BackendPost } from "@/api/mappers/post.mapper";

import { MOCK_ENABLED } from "@/mock/config";
import { mockTweetApi } from "@/mock/handlers";

import type {
  CreateTweetRequest,
  TogglePostBookmarkResponse,
  TogglePostLikeResponse,
  TogglePostRepostResponse,
} from "@/types/tweet";

const realTweetApi = {
  getAll: async () => {
    const posts = await apiClient.get<BackendPost[]>(ENDPOINTS.posts.all);

    return posts.map(mapPostToTweet);
  },

  getFeed: async () => {
    const posts = await apiClient.get<BackendPost[]>(ENDPOINTS.posts.feed);

    return posts.map(mapPostToTweet);
  },

  getBookmarked: async () => {
    const posts = await apiClient.get<BackendPost[]>(ENDPOINTS.posts.all);

    return posts.map(mapPostToTweet).filter((t) => t.bookmarkedByMe);
  },

  getLiked: async () => {
    const posts = await apiClient.get<BackendPost[]>(ENDPOINTS.posts.liked);

    return posts.map(mapPostToTweet);
  },

  getReposted: async () => {
    const posts = await apiClient.get<BackendPost[]>(ENDPOINTS.posts.reposted);

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
    apiClient.post<TogglePostLikeResponse>(ENDPOINTS.posts.like(id)),
  unlike: (id: string) =>
    apiClient.delete<TogglePostLikeResponse>(ENDPOINTS.posts.unlike(id)),
  repost: (id: string) =>
    apiClient.post<TogglePostRepostResponse>(ENDPOINTS.posts.repost(id)),
  unrepost: (id: string) =>
    apiClient.delete<TogglePostRepostResponse>(ENDPOINTS.posts.unrepost(id)),
  bookmark: (id: string) =>
    apiClient.post<TogglePostBookmarkResponse | undefined>(
      ENDPOINTS.posts.bookmark(id),
    ),
  unbookmark: (id: string) =>
    apiClient.delete<TogglePostBookmarkResponse | undefined>(
      ENDPOINTS.posts.unbookmark(id),
    ),

  toggleLike: (id: string, likedByMe: boolean): Promise<TogglePostLikeResponse> => {
    if (likedByMe) return realTweetApi.unlike(id);
    return realTweetApi.like(id);
  },

  toggleRepost: (id: string, repostedByMe: boolean): Promise<TogglePostRepostResponse> => {
    if (repostedByMe) return realTweetApi.unrepost(id);
    return realTweetApi.repost(id);
  },

  toggleBookmark: (id: string, bookmarkedByMe: boolean): Promise<TogglePostBookmarkResponse | undefined> => {
    if (bookmarkedByMe) return realTweetApi.unbookmark(id);
    return realTweetApi.bookmark(id);
  },
};

export const tweetApi = MOCK_ENABLED ? mockTweetApi : realTweetApi;
