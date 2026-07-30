/** @format */
import { apiClient } from "@/api/client";
import { ENDPOINTS } from "@/api/config";
import type { Tweet } from "@/types/tweet";
import { MOCK_ENABLED, mockTweetApi } from "@/api/mock";

const realTweetApi = {
  getFeed: () => apiClient.get<Tweet[]>(ENDPOINTS.tweets.feed),

  getByUsername: (username: string) =>
    apiClient.get<Tweet[]>(ENDPOINTS.tweets.byUsername(username)),

  create: (content: string) =>
    apiClient.post<Tweet>(ENDPOINTS.tweets.create, { content }),

  toggleLike: (id: string) =>
    apiClient.post<{ likedByMe: boolean; likesCount: number }>(
      ENDPOINTS.tweets.like(id),
    ),
};

export const tweetApi = MOCK_ENABLED ? mockTweetApi : realTweetApi;
